---
layout: post
title: The transverse-field Ising model
subtitle: An introduction to condensed matter field theory and topological phase transitions
tags: [quantum, cond-mat, seminar-series]
katex: true
---


A while ago I found [this excellent pdf](https://arxiv.org/pdf/2009.09208.pdf) on the arxiv, which
provides an excellent pedagogical introduction to the quantum Ising chain. Not only that, but it
achieves that rarity in physics which is often derisively called 'rigor mortis,' i.e. honest, full,
mathematically correct definitions of all of the operators, spaces and fields up for grabs. It would
be a waste of time to simply copy the PDF again but it is useful to
summarise a few key exact duality transforms here should anyone need to find them in a hurry.

# Formalism

## Bosons
A _boson_ is an eigenstate of the bosonic number operator $$a^\dagger a$$, which is composed of
operators satisfying $$[a_i,a_j^\dagger] = \delta_{ij}$$. A single pair $$a_i, a^\dagger_i$$ acts on the Hilbert space
$$\mathcal{F}_B = \operatorname{Span}\{
|n\rangle | n \in \mathbb{Z}_{\ge 0} \} $$, while the full Hilbert space of $$N$$ bosons is $$\mathcal{F}_B^{\otimes
N}$$. This space is sometimes called Fock space, hence the symbol $$\mathcal{F}$$. A given many body
boson state can be represented as a product of operators acting on the _vacuum_ $$|\empty \rangle =
|0,0,...,0\rangle$$

$$|n_1,n_2,...,n_N\rangle = \prod_{j=0}^N \frac{(a^\dagger)^{n_j}}{\sqrt{n_j!}} |\empty\rangle$$

Note that the order is irrelevant, since differnet boson 'flavours' commute.

## Fermions
A _fermion_ is an eigenstate of the fermion number operator, $$c^\dagger c$$, which is composed of
operators satisfying $$\{c_i, c_j^\dagger\} = \delta_{ij}$$.
A single pair $$c_i, c^\dagger_i$$ acts on the Hilbert space
$$\mathcal{F}_F = \operatorname{Span}\{
|0\rangle, |1\rangle \} $$, while the full Hilbert space of $$N$$ (distinguishable) fermions is $$\mathcal{F}_F^{\otimes
N}$$. Again, products of operators can be used to signify the 'bitstrings'

$$|n_1,n_2,...,n_N\rangle = \prod_{j=0}^N (a^\dagger)^{n_j} |\empty\rangle$$

Note that a choice of what order to do the product in corresponds to a sign convention. This sign
does not appear in expectation values, so is irrelevant.

An important kind of Fermion is a _Majorana Fermion_ (sometimes called a 'real Fermion') 


## Spins
A _spin_ is a collection of three operators acting on the Hilbert space $$\mathbb{C}^{2s+1}$$. The
collection of these operators also represents a $$2s+1$$-dimensional representation of $$SU(2)$$, aka
$$\text{Spin(s)}$$. The generators of the Lie group (and therefore any of their representations)
satisfy the canonical spin algebra

$$[S^i, S^j] = 2i \epsilon^{ijk}S^k$$

It's usually more helpful to reformulate these spins as ladder operators, $$S^\pm =
\frac{1}{2}\left[S^x \pm i S^y\right]$$. 

This allows us to mimic two important bosonic commutators:

$$[S^z, S^\pm] = \pm S^\pm$$
$$[a^\dagger a, a^\#] = \pm a^\# $$

where $$\# = \dagger$$ if '+' is chosen.

Things fall down when we look at the last one though:
$$[S^+, S^-] = S^z$$
$$[a, a^\dagger] = 1$$


## Jordan-Wigner transformation

Define the string operator $$K_j = \prof_{l=0}^{j-1} \sigma_j^z$$. The Jordan-Wigner fermion is
defined as
$$c_j = K_j S^+ _ j, c _ j^\dagger = (c _ j)^\dagger$$.

These operators obey the correct anticommutation relations and have the correct dimensionality to 
form a complete set of commuting observables.

## The Fourier Transform

Given some collection of operators $$c_r$$ (fermions, bosons, spins, or something else) over a $d$
dimensonal torus (With $L$ sites in all directions), it is
conventional to define a maximally nonlocal unitary roatioan of the Hilbert space using

$$c_k = L^{-d/2} \sum_j e^{-i k \cdot r } c_r$$




# Video Recordings and Exercises

## [Seminar 1: Introduction to fields](https://www.youtube.com/watch?v=uvkWrG-8gVU)

**Filling in the gaps**

Show that for Jordan-Wigner operators $$c_j, c_j^\dagger$$

1. $$\{c_i, c_j^\dagger\} = \delta_{ij}$$
2. $$\{c_i, c_j\} = \{c_i^\dagger, c_j^\dagger\} = 0$$
3. $$\sigma^-_j \sigma^\pm_j = c^\dagger_j c^\#_j$$, where $$\# =\dagger$$ if $$\pm = -$$

**Self Consistency**
Show that the fermion representaiton of $$\sigma^z_j = 1-2c^\dagger_j c_j$$ still obeys the
canonical commutators.

**Operator Absorption**
Show that for any fermion $$c$$, $$c^\dagger c c^\dagger = c^\dagger$$. Hence show that $$c^\dagger = - \exp(i\pi
c^\dagger c) c^\dagger$$.


**Essence of quantum mechanics**
Let $$\mathcal{H}$$ be a finite dimensional vector space. Prove that if one has a collection of $$n$$
commuting operators $$A_n$$, each of which have $$m_i$$ distinct eigenvalues $$\lambda_i$$, then
1. $$\operatorname{dim}(\mathcal{H}) = \prod_{i=1}^n m_i$$
2. The set $$ \{ \ket{\lambda_1} \otimes ... \otimes \ket{\lambda_n} \}$$, where
   $$\ket{\lambda_i}$$ run over all eigenvectors of $$A_i$$, is a basis for $$\mathcal{H}$$.
3. If $$H = \sum_{i=1}^n \epsilon_i A_i$$, where all of the $$A_i$$ are positive semidifinite and $$\epsilon_i \ge 0$$, then
   the lowest energy state corresponds to a choosing the minimum eigenvalues of all the $$A_i$$'s.
4. Take two diagonalisable linear operators $$A,B$$ on (finite dimensional) $$\mathcal{H}$$. Show that $$A,B$$ can be simultaneously diagonalised (i.e. there exists a common eigenbasis)
if and only if $$A,B$$ commute.

## [Seminar 2: The Fourier Transform](/)

**Rotations are a SU(2) automorphism**
Show that for any rotation matrix $$R \in SO(3)$$ and $$SU(2)$$ gnerators $$\sigma^i$$ (i.e. operators satisfying $$[\sigma^i, \sigma^j] = 2i\epsilon^{ij}_k \sigma^k$$),

$$[R^i_a \sigma^a, R^j_b \sigma^b] = 2i \epsilon^{ij}_k R^k_c \sigma^c$$


**Fourier Transforms**

1. Show that $$c_k$$ satisfies the canonical commutator $$[c_k, c_{k'}^\dagger]_\pm = \delta_{kk'}$$ if
and only if $$\frac{1}{L^d} \sum_r e^{-i(k-k')r} = \delta_{kk'} $$. Show that this is the case if
$$k = k_0 + \frac{2\pi n}{L}$$ for $$n\in \mathbb{Z}^d$$.
2. Verify that, in 1D, the boundary conditions $$c_{L+1} = \pm c_1$$ fix the value of $$k_0$$ to
   $$0$$ in the case of PBC and $$\pi/L$$ in the case of ABC.


**Filling in the gaps**

1. Determine what $$\mathcal{K}_p$$ looks like in the case of an odd-length chain.
2. Verify the following identites:

$$ \sum_{j=1^L}c_j^\dagger c_{j+1} = \sum_{k} e^{ik} c_k^\dagger c_k $$

$$ \sum_{j=1^L}c_j^\dagger c_{j+1}^\dagger = e^{2i\phi}\sum_{k} e^{ik} c_k^\dagger c_{-k}^\dagger $$

**Commutation Station**
Let $$\Psi_k = \left( c_{k1}\ c_{k2},\, ...\, c_{kN},\ c^\dagger_{-k1},\,...,\,c^\dagger_{-kN}
\right)^T$$, i.e. regarded as a column vector.
Show that the $$c$$'s are fermions (+) / bosons (-) if and only if

$$ [\Psi_k^\alpha, \Psi_{k'}^\beta]_\pm = \delta_{kk'} 
\begin{pmatrix}
1& & & & \\ 
 &\ddots& & & \\
 & & 1 & & \\
 & & & \pm 1 & \\
 & & & & \ddots\\
 & & & & & \pm 1
\end{pmatrix}^{\alpha \beta}
$$


