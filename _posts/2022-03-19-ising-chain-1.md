---
layout: post
title: The transverse-field Ising model
subtitle: An introduction to condensed matter field theory and topological phase transitions
tags: [quantum, cond-mat]
---


A while ago I found [this excellent pdf](https://arxiv.org/pdf/2009.09208.pdf) on the arxiv, which
provides an excellent pedagogical introduction to the quantum Ising chain. Not only that, but it
achieves that rarity in physics which is often derisively called 'rigor mortis,' i.e. honest, full,
mathematically correct definitions of all of the operators, spaces and fields up for grabs. IT would
be a waste of time to simply copy the PDF again but it is useful to
summarise a few key exact duality transforms here should anyone need to find them in a hurry.

# Formalism
{% katexmm %}
A _spin_ is a collection of three operators acting on the Hilbert space $\mathbb{C}^{2s+1}$. The
collection of these operators also represents a $2s+1$-dimensional representation of $SU(2)$, aka
$\text{Spin(s)}$. The generators of the Lie group (and therefore any of their representations)
satisfy the canonical spin algebra

$$
[S^i, S^j] = 2i \epsilon^{ijk}S^k
$$

It's usually more helpful to reformulate these spins as ladder operators, $S^\pm = \frac{1}{2}\left[S^x \pm i S^y\right]$. 

















{% endkatexmm %}
