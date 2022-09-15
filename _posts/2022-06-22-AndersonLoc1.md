---
layout: post
title: Anderson Localisation I
subtitle: Particles in a random potential
tags: [quantum, cond-mat, field-theory]
katex: true
---

_This series of posts is based on notes from a series of lectures by Dima Khmelnitskii, who is without question
the highest authority on this material. I apologise in afvance for the misunderstandings, inaccuracies or other
transcription errors that will be introduced in the process of synthesising them into blog form._




Consider an electron subject to a random potential $U$. 

$$\mathcal{H} = \frac{(p-eA)^2}{2m} + U(r)$$

We are civilised enough by now to let $c=\hbar = 1$. THe idea here is do get an idea of the
probability of finding this electron elsewhere in the solid later - in other words, the revered
quantity

$$ \langle  \rangle = K(r', t'; r,t)$$

Let $H \phi_\lambda = \epsilon_\lambda \phi_\lambda$.





Have soeme kind of distorder, DIrac delta normalised
$$\langle U(r) \rangle = 0, \langle U(r) U(r') \rangle = \gamm \delta(r-r')$$

Expectation is a path integral:

$$\langle F(U(r))\rangle = N \int \mathcal{D}U(r) F(\{U(r)\}) \exp \left(-\frac{1}{2\gamma}\int U(r')^2 \right) $$

Suppose one has a semiconductor. Density of states can be estimated as

$$g(E) = \frac{1}{2\pi} \text{Im} \int \frac{dr}{V} \left[ G_E^R(r,r') - G_E^A(r,r')\right]$$

in terms of the retarded/advanced Green functions,

$$G_E^{R/A}(r,r') = \sum_\lambda \frac{\phi_\lambda(r) \phi^*_\lambda(r')}{E-\epsilon_\lambda \mp i\delta}$$

The blurring of the DoS edges is called the 'band tail'. How do we calculate the DoS witth disorder?


Strange quantity: A 'two sided' DOS
$$\rho_\epsilon(\omega, r, r' = \sum_{\lambda, \lambda'} \delta(\epsilon_\lambda - \epsilon + \frac{\omega}{2}) \delta(\epsilon_{\lambda'} - \epsilon - \frac{\omega}{2} \phi_\lambda(r) \phi^*_{\lambda'}(r') $$



Want to discuss propagator: Propagation of probability, averaged over disorder
$$
K_\epsilon(\omga, r - r') = \langle \rho_\epsilon(\frac{\omega}{2}, r,r') \rho_\epsilon(-\frac{\omega}{2},r',r)\rangle_U$$

** Before average, K is  a functio nof r,r' independently; the average is needed to restore translational invariance **

$$ K_\epsilon(\omega, r,r') = \int d\mathbf{q} \frac{2\pi g(\epsilon)}{-i\omega + D q^2} e^{iq(r-r')} $$

$$ = \exp\left[ -\frac{(r-r')^2}{2Dt} \right] $$  with uniform DoS.

Look carefully at the  q=0, component. 

Dependence on q is the measure of being localised vs being free.

#Variable range hopping

COnsider a network of resistors (?) 

The sunnelling should look like 

$$ R_{ij} = \exp(-\frac{|r_i-r_j|}{L_c}) \exp(- \frac{\epsilon_i - \epsilon_j}{T}) $$

Note that gr^3 has dimensions of energy: by dimesnional analysis; tunnelling between the 

$$R(r) \sim \int \exp\left[ -\frac{r}{L_c} - \frac{1}{Tgr^3} \right]$$

$$\exp(-(T_M/T)^{1/4}) $$

Crucial insight: saddle point approximation

# Einstein relations

Classical random walks:
$$\sigma = e^2 g(\mu) D$$

$$\frac{\partial}{\partial t} - D \nabla^2$$

$$\sigma = \sigma_0 + \delta \sigma$$

What effect does QM have? If you have many processes, aplitudes $A_i$, classical probability is

$$W = |\sum_i A_i|^2 = \sum_i |A_i|^2 + \sum_{i\neq j} A_i A_j^* $$

i.e. sum of classical proabilities plus _interference_

Usually the interference doesn't matter (saddle point it); but when dealing with loops we have something extra: CCW and CW loops have same amplitude and opposite phase!



