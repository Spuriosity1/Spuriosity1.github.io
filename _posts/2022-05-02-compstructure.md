---
layout: post
title: "Computational Science Cookbook III: Databases for the lazy"
subtitle: "Not everything has to be gold plated to work"
tags: [code, comp-sci]
katex: true
---


If you've read the yet-to-be-published [Computational science cookbook II](../2022-05-02-complang0)
post, you'll know that it's very likely that multiple files will be involved in setting up, running
and post processing your simulations. The trouble is translation - How do you correlate the output
with the input?

I wanted to go into depth about the kinds of rudimentary database management you can use for running
physics simulations in a way that's quick to set up and reliable.

# lazyDB: database management through file names

There are famously two opposing paradigms in CS: functional and object oriented. The former works
only with pure functions, the latter encourages a complex stateful interplay of data-contianing
objects, and both have their respective strengths. 

In some sense the "functional" approach to naming output files is that
_Every output's filename contains all of the information needed to recreate it_.

E.g. suppose you have a numerical Schrodinger equation solver, your output files will look like
```
sewf?version=1.5?nsteps=200?potential=[9,4,2,1,2,4,9]?n=5?method=exactdiag_wf.csv
```
whereas the stateful paradigm approach would have output more like
```
sewf?version=1.5?infile=input/parabolic_9_wf.csv
```

Keeping everything in the filename looks hacky, but at the end of the day it's how the Web works:
GET requests look like
`https://duckduckgo.com/?q=databases+for+scientific+computing&t=newext&atb=v298-1&ia=web`, and they
power almost everything you see. It comes with many pros:
1. Completely obvious what is happening
2. Remembers the state of the input file when it is read, you're free to edit the infile while the
   simulation runs
3. No risk of overwriting data with different parameters
4. Easy to label graphs when parsing output

It also has its drawbacks though:
1. On UNIX, file names are limited to 255 characters, severely restricting the number of parameters
   you can use
2. It can be hard to tell at a glance what you actually have in the output folder (i.e. it "buries
   the lead" when running e.g. a phase diagram calculation)

The stateful-paradigm, input-file approach has the opposite situation:
**Pros**
1. Arbitrarily large and complex input structures can be used
2. If well-named, output files only contain the necessary information
**Cons**
1. Requires diligent naming conventions and careful file hygiene not to modify the input file between
   running the simulation and processing the output
2. Lazy file naming easily leads to mess
3. Easy to overwrite things by accident


I want to stress that storing parameters in the filenames of output you generate is a **good
practice**, even if it looks ugly / feels hacky. It's only going to be an issue if you plan on
radically changing the meaning of those parameters, which is easily avoided by giving it a different
name, or better yet storing a "version" field in the filename.

Generally speaking, I find myself dealing with around 10 numerical parameters 
(that shouldn't affect the answer much, unless they're too small) and 4-5 physical parameters. When
doing many trials (as in a Monte Carlo simulation) or many similar computations (as in a parameter
sweep), almost none of these change: it seems wasteful to clutter the output folder with a bunch of
parameters that are 90% identical.

I therefore suggest a compromise - Just do both!

Specifically, my `basic_parser` class implements two interface functions; `from_file` and
`from_argv`. Simulation files then start with the verbose, but transparent paragraph

```c++

// Optional parameter variables
    unsigned
        nreps;
    double
        phi,
        T; 
    
	// The header row for any CSV outputs
    param_t p("My program v" + VERSION + currentDateTime() );

    // Bind all of the globals
    p.delcare("nreps", &nreps);
    p.declare("phi", &phi);
    p.declare("temperature", &T);

    //read the params from file
    p.from_file(argv[1]);

    std::filesystem::path output_path(argv[2]);

    // Extract the input file's root and use it as the base for the output file
    std::filesystem::path in(argv[1]);
	// remove the file extension
    std::string prefix(in.filename().replace_extension());
	// Append all of the command line arguments from argv[3] and on as filename annotations
    prefix += p.from_argv(argc, argv, 3);

	// Ensure that we did not miss anything
    p.assert_initialised();

	// calculations
	std::ofstream ofs(prefix + "_output1.csv");
```

This simulation has three input parameters `nreps`, `phi` and
`temperature`, where we want to sweep phi at fixed temperature.

Have the simulation program read the file `high_temp_template.toml` consisting of
```
# measured in units of J
temperature = 100
# number of iteration steps
nreps = 10000
# the coupling constant
# phi = 0
```

Note that the `phi` specification is commented out, so it must be passed from the command line:
```
bin/sim input/high_temp.template.toml output_folder/ --phi=0.56
```

This produces an output (relative to the directory that the above line was run in) looking like
```
output/high_temp?v=1.5?phi=0.56.quantity1.csv
output/high_temp?v=1.5?phi=0.56.quantity2.csv
```
The `v` flag is hard-coded into the executable, meaning 'version', and in general you might want to
make several output files for the different quantities of interest. It might also be advisable to
add a timestamp to the header row of your CSV files as a sanity check. 





Running a sweep is simple using a bash for loop
```bash
for phi in `seq 0 0.01 1`; do
bin/sim input/high_temp_template.toml output_folder/ --phi=$phi
done
```

This kind of problem is known as and "embarrassingly parallel" calculation: there are
a huge suite of executables that can all run completely independent of one another.
Queuing all of these as jobs in parallel gets slightly trickier if you
want to avoid spawning thousands of threads, but that's a topic for another post.


## RegEx

Regular Expressions, or regex, are an absolutely indispensable part of parsing human-readable files.
They are a kind of shorthand for grabbing parts of strings, which is helpful if important simulation
parameters are stored in strings. For example, when generating a phase diagram you might have a
folder full of output files similar to
```
run_2022-05-05%phi=0.2000;%T=1.00e-5;_order.csv
run_2022-05-05%phi=0.2000;%T=1.00e-3;_order.csv
run_2022-05-05%phi=0.2000;%T=1.00e-1;_order.csv
run_2022-05-05%phi=0.4000;%T=1.00e-5;_order.csv
run_2022-05-05%phi=0.4000;%T=1.00e-3;_order.csv
run_2022-05-05%phi=0.4000;%T=1.00e-1;_order.csv
...
```
This naming convention is inspired by the web, which uses `&parameter=value` to pass arguments to
the server without navigating to a new page. Now say you want to accumulate all of these in a python
file: it's a pain to do using string slicing and dicing, but regex has a solution:

```python
import re # the regex module
from glob import glob
import numpy as np

# Feed the stem in from the command line (shell autocomplete avoids needing to remember it properly)
files = glob(sys.argv[1] + '*_order.csv')
print("Averaging over\n")
print(files)
for file in files:
    res = re.search("%phi=([0-9.+\-e]+);%T=([0-9.+\-e]+);", file)
    phi = float(res.group(1))
    T = float(res.group(2))
    print(f"phi = {phi}, T = {T}")
    data = np.genfromtxt(file)
    # ... averaging and aggregating
```
Admittedly, regex looks like random noise the first time you look at it. Let's break it down:

```
%phi=([0-9.+\-e]+);%T=([0-9.+\-e]+);
%phi=                                  # Matches the exact chatacters "%phi="
     (                                 # Start of capture group 1
      [0-9.+\-e]                       # Matches any of the charaters "0123456789.+-e"
                +                      # Any nonzero number of the above class
                 )                     # End of capture group 1
                  ;%T=                 # Matches the literal characters ";%T="
                      (                # Start of capture group 2
                       [0-9.+\-e]      # Matches any of the charaters "0123456789.+-e"
                                 +     # Any nonzero number of the above class
                                  )    # End of capture group 2
                                   ;   # Matches the literal character ";"

```

There's a [fantastic website](https://regexr.com/) for trying out regex, with a dynamically
generated explainer below the input stream. This is an essential way to dry-run your regex strings
to ensure that they make sense.
Regex allows you to be a lot more versatile than the simple `?` delimited conventions mentioned
earlier. In particular, it allows you to add in escape sequences if the need arises.

`vim`, VS Code, and most other text editors support using regex to search, which is an invaluable
tool when you want to refactor a piece of code.

# Hard Mode: Using a real database

The canonical file format for complicated, array-heavy data structures is
[HDF5](https://portal.hdfgroup.org/display/HDF5/Examples+from+Learning+the+Basics). 

The downside of doing this is that parallelisation is suddenly a headache:
having multiple threads contribute to the same file means you suddenly need to worry about locks,
mutexes and the famously difficult-to-debug data races.

