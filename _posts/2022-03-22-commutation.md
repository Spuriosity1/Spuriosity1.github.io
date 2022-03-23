---
layout: post
title: Commutation
subtitle: A utility for doing nasty commutators
tags: [quantum, cond-mat, code]
katex: true
---



If you're trying to follow along with the [kitaev seminar series]({% link _posts/2022-03-19-ising-chain-1.md %}), then you may have started to notice that dealing with massive strings of commutators is a pain. Generally, the process of simplifying an operator expression is quite mechainical:

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

### Operators

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
is a hierarchy of algebra containers

`Operator < Term < Expression`

where a Term corresponds to a product of Operators, and an Expression to a sum of Terms. This has somewhat
counter-intuitive consequences for the types of the results under multiplication

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
as an `Expression`, right? The reason has a lot to do with the `CommutatorAlgebra`.

### Commutators






The fundamental operations are `move_right`, `move_left` and `collect`. There's also (limited)
support for factorisation -

{% highlight python %}
x
{% endhighlight %}



### Substitutions

Alright, I did re-implement a tiny bit of _Mathematica_. I found that I could not bear to part with
`ReplaceAll`, aka `/.`.

`Expression.replaceall((glob1, repl1), [(glob2, repl2),] ... )`

`glob` must be castable to `Term`, and `repl` may be anything castable to `Expression`. This has to
be written as one function (rather than a series of single-term replacements to deal with the fairly
common case that we want to swap two operators. 

```python
x = a*b + b*c*c
x.replaceall((b,a),(a,b))
```

It's too much to ask for replacements of full
expressions - it's tricky to implement and (imo) largely pointless.
