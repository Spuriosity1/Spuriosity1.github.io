---
layout: post
title: The transverse-field Ising model
subtitle: An introduction to condensed matter field theory and topological phase transitions
tags: [quantum, cond-mat]
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
|n\rangle | n \in \mathbb{Z}_{\ge 0} \} $$, while the full Hilbert space of $N$ bosons is $$\mathcal{F}_B^{\otimes
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
$c_j

These operators obey the correct anticommutation relations and have the correct dimensionality to
serve as a faithful representation of 

# Video Recordings

## Seminar 1: Introduction to fields
Exercises:
**Filling in the gaps**
Show that for Jordan-Wigner operators $$c_j = K_j S^+_j, c_j^\dagger = (c_j)^\dagger$$

1. $$\{c_i, c_j^\dagger\} = \delta_{ij}$$
2. $$\{c_i, c_j\} = \{c_i^\dagger, c_j^\dagger\} = 0$$

**Self Consistency**
Show that the fermion representaiton of $$\sigma^z_j = 1-2c^\dagger_j c_j$$ still obeys the
canonical commutators.

**Operator Absorption**
Show that for any fermion $c$, $c^dagger c c^\dagger = c^dagger$ 

**Essence of quantum mechanics**
Let $$\mathcal{H}$$ be a finite dimensional vector space. Prove that if one has a collection of $n$
commuting operators $$A_n$$, each of which have $m_i$ distinct eigenvalues $\lamnda_i$, then
1. $$\operatorname{dim}(\mathcal{H}) = \prod_{i=1}^n m_i$$
2. The set $$ \{ |\lambda_1\rangle \otimes ... \otimes |\lambda_n\rangle \}$$, where
   $$|\lambda_i\rangle$$ run over all eigenvectors of $$A_i$$, is a basis for $$\mathcal{H}$$.

