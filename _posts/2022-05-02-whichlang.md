---
layout: post
title: "Computational Science Cookbook II: Choosing your Ingredients"
subtitle: C has never been improved on, change my mind
tags: [code, comp-sci]
katex: true
private: true
---



<meta http-equiv="Refresh" content="0; url=https://youtu.be/dQw4w9WgXcQ" />

# Preamble

Equipped with the disproportionate confidence afforded by 2 beers and 3 weeks of
online classes, the first-year compsci student at the pub declares that

> Scientists are stuck in the 1970s. I hear some people are still using FORTRAN!

It goes without saying that computing has changed radically since nuclear physicists at Los Alamos
were calculating collision cross sections of uranium nuclei.
Tools generally tend to get better over time - We no longer need to manually input
punch-card tape to load programs, and can write in a human-like syntax rather than the whatever this
is:

```
00101 0 0000000000 0 0: T0S 
10101 0 0000000010 0 1: H2S  
00101 0 0000000000 0 2: T0S 
00011 0 0000000110 0 3: E6S 
00000 0 0000000001 0 4: P1S 
00000 0 0000000101 0 5: P5S 
00101 0 0000000000 0 6: T0S 
01000 0 0000000000 0 7: I0S 
11100 0 0000000000 0 8: A0S 
00100 0 0000010000 0 9: R16S 
00101 0 0000000000 1 10: T0L 
01000 0 0000000010 0 11: I2S 
11100 0 0000000010 0 12: A2S 
01100 0 0000000101 0 13: S5S 
00011 0 0000010101 0 14: E21S 
00101 0 0000000011 0 15: T3S 
11111 0 0000000001 0 16: V1S 
11001 0 0000001000 0 17: L8S 
11100 0 0000000010 0 18: A2S 
00101 0 0000000001 0 19: T1S 
00011 0 0000001011 0 20: E11S 
00100 0 0000000100 0 21: R4S 
11100 0 0000000001 0 22: A1S 
11001 0 0000000000 1 23: L0L 
11100 0 0000000000 0 24: A0S 
00101 0 0000011111 0 25: T31S
11100 0 0000011001 0 26: A25S
11100 0 0000000100 0 27: A4S 
00111 0 0000011001 0 28: U25S 
01100 0 0000011111 0 29: S31S 
11011 0 0000000110 0 30: G6S 
```

(FYI this is the bootloader for EDSAC, the first ever practical general-purpose computers built at
Cambridge in 1949) 

When starting out in scientific computing, one is often presented with a concrete physical problem -
e.g. solving some kind of exotic Schrödinger equation - and left to work out the implementation
details themselves. These `details' often consume more time than the physics, so I wanted to outline

1. Some guidance on which language to select for which kind of problem
2. Using known software-engineering design patterns for scientific problems
3. Strucutring your code for unit tests

I begin with a very brief summary of various languages that are in use in various corners of
scientific computing. In general, you should select languages to minimise time cost to you - ``go
with what you know'' is not always the optimal solution, but it's rarely a bad solution. The other
thing to keep in mind is that scientific computing has fairly different requirements to the projects
that software engineers work on. Router code must run flawlessly (or at least resiliently) for
months to years, science code runs only once then exits. Web apps need to carefully sanitise any
input data they're given; science data is usually trustworthy. Marginal efficiency improvements
can save months of CPU time in large scale high-performance computing, your simulation is not as
time-critical. For this reason, a lot of software engineering best practice is only partially
applicable. That being said, clean, readable code allows your code to be shared and checked for
errors more easily. A balance must be struck.

# Languages

## FORTRAN

It's fun to hate on it for being old fashioned, and sure, its syntax is awkward, but
let's not forget that pre-1980 this was the standard for all scientific computing, and remains so to
this day when doing hardcore supercomputer numerics. It's completely possible to write readable code
in FORTRAN, but one must be more regimented about it. You can get away with a lot of terrible
practices here.

[Click here](https://fortran-lang.org/learn) for a good-quality, minimal, 
and up-to-date reference on this language.

**Use this for**

 - Fast simulation code
 - Things that need to interface with old code (e.g. plasma physics sims)
 - Manual control of the bare metal

**Absolutely do not use this for**

 - Data Processing
 - Plotting


## C

Arguably the most influential of the low-level languages. C's clean syntax and revolutionary type system
changed the game when it hit the world in the mid 1970s. `C` is responsible for things we now take for
granted, like curly braces, for loops, structs, function pointers, and lowercase variables. macOS, 
the Linux kernel, the canonical Python
interpreter, and pretty much all GNU software either is written in C or was written in C at some point.
Anything that can be done in fortran can generally be done just as easily (or rather, just as painfully)
in `C`, it's just a matter of which syntax sugar you prefer.

**Use this for**

 - Fast simulation code
 - Manual control of the bare metal

**Absolutely do not use this for**

 - Data Processing (unless using ROOT, in which case, you have no choice)
 - Plotting

The main drawback of C, FORTRAN, and other `old school' language is memory management. In
C and FORTRAN, everything must be done by hand - if you are in the business of allocating and
freeing large amounts of memory on the fly, you need to be _very_ careful not to `forget about' any
memory you ask for. Higher level languages like java, python and so on are much friendlier - they
have garbage collectors that clean up any inaccessible memory for you, but at a severe performance
cost that can easily be terminal.

## C++

Originally "C with Classes", this is now arguably the most common compiled language written today.
Though knowing C is not a strict prerequisite for C++ - the latter is not a pure superset of the
former, i.e. there exist valid C programs that will not compile under a standard C++ compiler, but
it's pretty close.

For this reason, C++ is generally a better choice than C for new - or even old - projects. While it is painless to
interface with old C code, it is also equipped with powerful methods of bundling functions with data
(i.e. classes / structs) that can make your code much easier to understand and debug.


## Rust

Rust sells itself as a language with low-level speed that is memory safe,
which I won't deny is an appealing trait. On the other hand, good old FORTRAN was designed _with
scientific computing in mind_ - after all, that was the original point of a computer - and the newer
stuff is oriented more towards businesses - web technologies, databases, rendering and game engines,
all of which have substantially different requirements. Facebook's servers need to harvest your
data 24/7, and it's unacceptable for them to crash when a weird edge case comes up; your
simulation of an Ising model runs once and exits - feel free to leak memory all you like, 
the OS will clean up after you. The point of science code is to be correct and to run fast,
systems-level concerns are really just a distraction.

The other problem is that Rust's support of scientific library interfacing is very rudimentary -
it's new, so the interface hasn't been tested for weird edge-case errors. Tose interfaces that do
exist are all `unsafe`, i.e. they don't have any of the nice memory-safety properties that Rust touts as its major advantage.



## Python

## Mathematica

## Bash




## The New Kid on the Block: Julia






> There are only two kinds of languages: the ones people complain about and the ones nobody uses.

 ~ Bjarne Stroustrup, creator of C++
