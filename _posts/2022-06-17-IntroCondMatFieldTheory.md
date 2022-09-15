---
layout: post
title: Intro to condensed matter field theory
draft: true
subtitle: "QFT: Not just for building nukes"
tags: [quantum, cond-mat]
katex: true
---


I'll preface this by recommending that you go and read Atland and Simons, Condensed Matter Field
Theory.


## Coarse Graining

When writing down a condensed matter field theory, we are looking for descriptions of _collective phenomena_ that are relevant at a macroscopic length scale. 
The fields $\phi(x)$ are _coarse grained_, and generally speaking, only valid descriptions of the system at _very low energy_. The fact that the theory arose from a lattice gives us an intrinsic length scale $a$ for the lattice parameter, which in turn can be used to regulate any divergent $k$ space integrals. 

## Functional Integral

If you're a mathematician, the appearance of the dreaded Feynman path integral will no doubt cause
some anguish. I'm going to try and get ahead of the curve by stating straight out that it's fine, and
I'll hear no more slander against it.

In particular, being in a condensed matter setting actually removes many of the definitional headaches that the
particle physicists need to worry about. The problems come when trying to define the operation

$$ \int \mathcal{D}\phi F[\phi] $$

for an arbitrary functional $$F: C^\infty(M) \to \mathbb{C}$$.

Fortunately, we don't ever need to _actually_ do this when we let the field live on lattice sites
$\Lambda$ -
in that case we have an _ordinary_ integral over all $N$ lattice sites - 

$$\int \mathcal{D} \phi F[\phi(\mathbf{r})] = \int \prod_{\mathbf{r} \in \Lambda} d\phi_\mathbf{r} 
F[\{ \phi_{\mathbf{r}_1}, \phi_{\mathbf{r}_2}, ... , \phi_{\mathbf{r}_N} \} ] $$

which may in general diverge, but at least it's obvious _what_ is diverging now.

## The Free-Particle Propagator on a lattice

Let's now repeat the classic Feynman argument and see if we can make sense of it. Consider a
tight-binding model on a triply-periodic lattice $\Lambda$, with $N$ sites.

The Hamiltonian is just $H = \frac{p^2}{2m}$. In lattice-world, it's not very clear what meaning, if
any, 'momentum' has, since it's typically defined as the Lie algebra generator of the Euclidean translation
group, which has well and truly left the building.


## Bloch states

Let's ignore the quasicrystals and assume we have a periodic Hamiltonian in $d$ spatial dimensions.
I take as my definition that the Hamiltonian commutes with translations by all $d$ primitive unit cell
vectors $\mathbf{a}_i$, $\hat{T}_i$.

This suggests an "intuitive" basis for the Hilbert space, or rather, an
intuitive partitioning of the free-space Hilbert space. Since an arbitrary discrete translation
$$\hat{T}_\mathbf{n} = \prod_{j=1}^d \hat{T}_j^{n_j}$$ commutes with the Hamiltonian, there is a
basis of the Hilbert space diagonal with respect to both of these operators. That is the essence of
Bloch's theorem.

**Theorem Statement**
The global Hilbert space of a periodic system $\mathcal{H}$ factors like
$$\mathcal{H} = \oplus_{k \in BZ} \mathcal{H}_1(k)$$.
Each single-$k$ Hilbert space is vector-space isomorphic and associated with a unique wavevector in the first Brillouin zone.

This basis is conventionally expressed as

$$ \left\{ \ket{\epsilon( k )} \right\} $$

where $H \ket{\epsilon (k) } = \epsilon \ket{\epsilon(k)}$ and $\hat{T}_\mathbf{R} \ket{\epsilon, k} =
\exp(i \mathbf{k} \cdot \mathbf{R} ) \ket{\epsilon, k}$.

**Exercise:** Prove Bloch's theorem assuming only that the Hamiltonian commutes with the
$\hat{T}_{\mathbf{R}}$ wavevectors.

There is a meaningful sense of "momentum operator", which can be defined
implicitly via the operator log of $\hat{T}$

$$ \exp(-i \hat{\mathbf{p}} \cdot n_j \mathbf{e}_j ) \equiv \hat{T}_{\mathbf{n}} $$


# The path integral partition function

Recall that the partition function may be understood as

$$\mathcal{Z}[\beta] = \sum_{i \in \{\text{all states}\}} \exp(-\beta E_i)$$

Suppose that your system's configuration depends on $N$ _continuous_ degrees of freedom $\phi_i$. Then the sum should be expressed as

$$\mathcal{Z}[\beta] = \int \prod_i d\phi_i \exp(-\beta H[\phi_i])$$

Promoting those $N$ degrees of freedom to lattice sites, the earlier notation allows us to go to the
full field-theoretic picture

$$\int \mathcal{D}\phi \exp(-\beta H[\phi])$$

In truth, I've been very glib here. 



# The Green's Function

_Reference: Chapter 7 (Response Functions) of Atland and Simons_

A Green's function is, at the highest level of abstraction, the inverse of a differential operator.

The Schrödinger equation can be written like $\mathcal{L}(E) \psi = (H - E) \psi = 0$

Presuming that $E$ is _not_ an energy eigenvalue, the operator $\mathcal{L}(E)$ can be readily inverted. Let
$\epsilon_\lambda,\ket{\lambda} $ be the full spectrum eigenvalues and eigenstates; then the operator

$$\hat{G}(E) = \sum_\lambda \frac{\ket{\lambda}\bra{\lambda}} {\epsilon_\lambda - E}$$

can quickly be seen to do the job - 



