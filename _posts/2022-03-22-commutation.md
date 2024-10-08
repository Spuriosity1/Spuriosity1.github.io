---
layout: post
title: Commutation
subtitle: A utility for doing nasty commutators
tags: [quantum, cond-mat, code]
katex: true
---



If you're trying to follow along with the [kitaev seminar series]({% link _posts/2022-03-19-ising-chain-1.md %}), then you may have started to notice that dealing with massive strings of commutators is a pain. Generally, the process of simplifying an operator expression is quite mechanical:

1. Write down the expression.
2. Rearrange everything until it's in the same order.
3. Collect like terms.

It's so mechanical in fact, that I'd be surprised if nobody thought of it before. Probably for lack
of research skills, I can't seem to
find anything that does _exactly_ what I need (rather than something _similar_, like Mathematica's
`NCexpression` library), so I just [implemented it myself in
python](https://github.com/Spuriosity1/Commutation).

# Commutation: a utility for dealing with nasty non-commutative strings

The trouble with _Mathematica_, I find, is that it never does what you want it to (at least not
without a lot of jiggling). I'm not going to try and re-implement _Mathematica_ for obvious reasons,
rather, I want to cook up something akin to a proof assistant that can tell you if you got the minus
signs right. The general structure of a basic calculation might go

{% highlight python %}
from Commutation import CommutatorAlgebra, Operator
Sz  = Operator('Sz','S^z')
Sup = Operator('S⁺','S^+')
Sdn = Operator('S⁻','S^-')

ca = CommutatorAlgebra()
ca.set_commutator(Sz, Sup)(Sup)
ca.set_commutator(Sz, Sdn)(Sdn)
ca.set_commutator(Sup, Sdn)(2*Sz)

x = Sz*(Sup*Sdn + Sdn*Sup)
ca.move_right(x, Sz)
x.show()
# can further simplify
ca.move_left(x, Sup)
x.show()

{% endhighlight %}

At least within a jupyter notebook, these `x.show()` calls render as LaTeX. The above input produces

$$ +1 S^+ S^- S^z +1 S^- S^+ S^z +2 S^+ S^- +2 S^- S^+ \\
+2 S^+ S^- S^z +4 S^+ S^- -2 S^z S^z -4 S^z 
$$

## Operators

```python3
Operator(opstring, oplatex=None, scalar=False)
```
- `opstring` the "name" of the operator. This is what is returned when `__str__(self)` is called.
- `oplatex` what is used for `op.show()` LaTeX rendering. Defaults to `opstring`.
- `scalar` Flags whether the operator can be safely commuted with any other operator.

`Operators` have a full algebra of operations defined for them - you can do +, - , * as you would
expect. Multiplication by 'pure' scalars (e.g. 3) is also well defined, but critically, is only
defined for `int` and `fractions.Fraction` objects. This is a symbolic algebra library, and we
require cancellations to stay around: floating points would make everything messy (and are pointless
in this context).

The other subtlety is that Operators are not closed under multiplication or addition. In fact, there
is a hierarchy of algebra containers:

`Operator < Term < Expression`

Formally, `Term` implements the concept of a monoid `*` structure, while `Expression`
implements an Abelian group `+` structure. More concretely, a `Term` corresponds to a product of `Operators`, and an `Expression` to a sum of `Terms`. This has somewhat
counter-intuitive consequences for the types of the results under multiplication:

<table>
<tbody>
<tr> <td class=hl>`*` </td> <td class=hl> O </td><td class=hl> T </td><td class=hl> E </td> </tr>
<tr> <td class=hl> O </td> <td> T </td><td> T </td><td> E </td> </tr>
<tr> <td class=hl> T </td> <td> T </td><td> T </td><td> E </td> </tr>
<tr> <td class=hl> E </td> <td> E </td><td> E </td><td> E </td> </tr>
</tbody>
</table>
The result of any addition operation is an `Expression`.


You may wonder if this complication is really necessary - after all, everything can be represented
as an `Expression`, right? The reason has a lot to do with the need to do replacements - it's kind
of ambiguous to try the multiterm replacement `ac + ccb /. {a + b -> d}` - should the engine try to
commute b into the right spot for the replacement to be possible? Would anyone ever want that
behaviour? What should the engine do when there are multiple relevant commutators, e.g. `[a+b, c] =
f`, `[a-b, c] = g`?

It's a lot easier to just draw a line under it and restrict the commutators
to the signature `[Operator, Operator]  = Expression`, which is what I did. This is not as tight a
constraint as it may seem, which we'll get to in a minute.

## Commutators

`CommutatorAlgebra(strict=false)`

The object repsonsible for storing commutator data is a `CommutatorAlgebra`. The flag `strict`
signals whether or not to assume that unknown operators are scalars / commute with everything else.

An algebra is built using successive calls to `CommutatorAlgebra.set_commutator(a,b)(expr)` or
`CommutatorAlgebra.set_anticommutator(a,b)(expr)`. `a` and `b` must be `Operator`, while `expr` must be `Expression`-castable.
Note the weird call sequence, where
`set_commutator` actually returns a setter function, which is purely for syntax sugar.

{% highlight python %}
ca = CommutatorAlgebra()

az = Operator('az','S^z_a')
ap = Operator('a⁺','S^+_a')
am = Operator('a⁻','S^-_a')

# note the funky bracket sequence - set_commutator actually returns a function
ca.set_commutator(az,ap)(ap)
ca.set_commutator(az,am)(-1*am)
ca.set_commutator(ap,am)(2*az)


{% endhighlight %}


The set values can then be read out with the transparently named `get_commutator` and
`get_anticommutator` methods. 

The fundamental operations are `move_right` and `move_left`:
{% highlight python %}
x = ap*az*am + am*az*ap

ca.move_right(x,am)
ca.move_right(x,ap)
print(x)
#+2 az a⁻ a⁺  +2 az az  -2 az

{% endhighlight %}


# Working with `Expression`s

Most algebraic operations are implemented for `Expression` types.

The _only_ method authorised to change operator order outside of a `CommutatorAlgebra` is `Expression.move_scalars()`, which
moves all Operators maerked with the `scalar` flag to the left (or right, when called with
`Expression.move_scalars("right")`).

There's also (very limited) support for factorisation -

{% highlight python %}
x = a*b*c*d*f + a*b*b*d*f

fr, ba = x.factor()
print('(',fr, ')*(', ba,')')
# (   +1 a b c  +1 a b b )*( +1 d f )

fr, ba = x.factor('left')
print('(',fr, ')*(', ba,')')
# (   +1 a b c  +1 a b b )*( +1 d f )

fr, ba = x.factor('right')
print('(',fr, ')*(', ba,')')
# ( +1 a b )*(   +1 c d f  +1 b d f )
{% endhighlight %}


This literally just pulls out common factors from the front or back. It does not reorder anything.

One can also collect like terms

{% highlight python %}
y = 4*ap*am - 4*ap*am + 1
print(y)
#  +4 a⁺ a⁻  -4 a⁺ a⁻  +1
y.collect()
print(y)
#  +1

{% endhighlight %}
... though this does not reorder anything, so will not cancel `KA*KB - KB*KA` without help from a
`move_scalars` or `move_right`.



## Substitutions

Alright, I did re-implement a tiny bit of _Mathematica_. I found that I could not bear to part with
`ReplaceAll`, aka `/.`.

`Expression.replaceall((glob1, repl1), [(glob2, repl2),] ... )`

`glob` must be castable to `Term`, and `repl` must be castable to `Expression`. This has to
be written as one function (as opposed to a sequence of single-term replacements) to deal with the fairly
common case that we want to swap two operators. 

{% highlight python %}
x = a*b + b*c*c
y = x.replaceall((b,a),(a,b))
print(y)
#   +1 b a  +1 a c c
{% endhighlight %}

For single terms, there's also the macro `Expression.replace(glob, expr)`. It's too hard to deal
with the case when `glob` is an `Expression` - it's tricky to implement and (imo) largely pointless.
Again, this operation is outside `CommutatorAlgebra` so is not authorised to reorder terms.


## New knowledge from old

A useful trick (in life, as well as in quantum mechanics) is to recognise frequently occurring
blocks of operators and abstract them to a name. Similarly, if there is some frequently occurring
expression, it may be more useful to work with the abstraction than with the base operators.

Suppose you care about the spin of a tetrahedron, $$Stet = S^z_1 + S^z_2 + S^z_3 + S^z_4$$. There
may still be $$S^\pm_i$$ operators hanging around, and you want to simplify some complicates
expression involving the lot of them, e.g. `Stet *S1⁺*S2⁻`. You can get around this using the
following recipe:

{% highlight python %}
Sz = [Operator('Sz%d'%i,'S^z_%d'%i) for i in range(4)]
Sp = [Operator('S⁺%d'%i,'S^+_%d'%i) for i in range(4)]
Sm = [Operator('S⁻%d'%i,'S^-_%d'%i) for i in range(4)]

ca = CommutatorAlgebra(strict=True)

# define the elementary commutators

for z, plus, minus in zip(Sz, Sp, Sm);
	ca.set_commutator(plus, minus)(2*z)
    ca.set_commutator(z, plus)( plus )
    ca.set_commutator(z, minus)( -1*minus )

# `real` operator
Stet = Sz[0] + Sz[1] + Sz[2] + Sz[3]


# symbolic, formal operator
Stet_s = Operator('Stet','S_{\text{tet}}')


def calc_commutator(a, b):
	x = a*b - b*a
	# simplify
	for z in Sz:
		a.move_left(x,z)
	return x

# give ca the necessary knowledge
for i in range(4):
	ca.set_commutator(Stet_s, Sz[i])(calc_commutator(Stet, Sz[i]))
	ca.set_commutator(Stet_s, Sp[i])(calc_commutator(Stet, Sp[i]))
	ca.set_commutator(Stet_s, Sm[i])(calc_commutator(Stet, Sm[i]))


expr = Stet_s*Sp[0]*Sm[1]*Sp[2]*Sm[4]

# ... whatever you need to do
ca.move_right(expr, Stet_s)

# ... and back to the original form
finished = expr.replace(Stet_s, Stet)
expr.show()


{% endhighlight %}

This gets used a lot in the [Ringflip file](https://github.com/Spuriosity1/Commutation) on GitHub.

# The End of the day
I'm certain that this could be made 'smarter', but I think it's fit for the purpose it's designed
for: double-checking algebraic brute force. Feel free to contact me via GitHub if you have any
issues using it or want to complain about the low-quality documentation.


