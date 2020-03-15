# Contributing Guide for Students
[LICENSE](https://github.com/orcasound/orcagsoc/blob/master/GUIDE_LICENSE.md) (This template was adapted from [ESIP](https://www.esipfed.org/)'s organization [template](https://github.com/ESIPFed/gsoc/blob/master/STUDENT-proposal-template.md): thank you ESIP!)

## Getting Started Early

Experience shows that the best thing to help your application is to engage with the
organization you want to work with early. For Orcasound you should read about contributing as a “hacker” and then [introduce yourself in the #gsoc channel of our Slack workspace](orcasound.slack.com). [The opensource guide](https://opensource.guide/how-to-contribute/) has a
good introduction how to start contributing to open source projects.

## Am I experienced enough?

The answer is generally: **Yes**. We value creativity, intelligence and
enthusiasm above specific knowledge of the libraries or algorithms we use. We
think that an interested and motivated student who is willing to learn is more
valuable than anything else. The range of available projects should suit people
with different backgrounds. At the same time if you have experience using your
project of choice or one of its dependencies (e.g. language) make sure to let
us know about that as well.
[FLOSS manual](http://write.flossmanuals.net/gsocstudentguide/am-i-good-enough/)
gives a good overview of this part for GSoC.

## Our Expectations From Students

### During the application phase

*The tips listed here can help your application. They are not required*

Organizations usually favor students that show a regular communication with
possible mentors / organization until Google announces the accepted projects.

Establishing a regular communication is good for 2 reasons. It shows that you
are a reliable student and that you have good communication skills. Good
communication skills are an important part of GSoC since a student and mentor
can rarely meet in person. Please, communicate through the slack #gsoc channel, or on github. Please, do not send private messages to mentors and organizers; if you have a question, it is highly probable another person has the same question, and they can benefit from the open discussion.

You can get started by exploring the references in the project description, getting familiar with the Orcasound repositories and data, attempting some of the suggested steps and trying out listed tools, reading through the wiki and contributing missing details, resolving issues, reviewing PRs, improving code documentation and style, and adding tests.  Before submitting a big code change, make sure you open an issue to discuss with other contributors. 

When we evaluate an application we use the following point system to get a
baseline comparison of students. We are listing those points to help you
successfully apply and not missing an obvious point. You can always do more, but
please check those points. We will be fair, we promise.

- 5pts Communicated with us org mentors ?
- 5pts Communicated with the community ?
- 5pts Do you reference projects you coded WITH links to repos or provided code?
- 5pts Do you provide all demanded ways of contact (email, slack name, github  if available)
- 3pts Do you add a preliminary project plan (before, during, after GSOC)?
- 3pts Do you state which project you are applying for and why you think you can do that?
- 3pts Do you have time for GSOC? This is a paid job! State that you have time in your motivation letter, and list other commitments!
- 0pts Be honest! Only universal Karma points. 🙂
- 5pts Did you submit a pull request to the existing code? Or did you do discover issues with the current code?
- 5pts Communication until accepted students are announced.

### During the summer

*The items here are a requirement for students during the summer*

**Communication**

- Write a short report for us every second week in a blog
- Commit early and commit often! Push to a public repository (e.g. github) so
  that we can see and review your work.
- Actively work on our project timeline and communicate with us during the
  community bonding period.
- Communicate every working day with your mentor. Preferably in public using the
  standard channels of your project.
- If there is a reason why you can't work or can't contact us on a regular basis
  please make us aware of this.
- If you don't communicate with us regularly we will fail you.

**Evaluations**

- Set a realistic goal for all evaluation deadlines. If you fail to meet your
  own goal we are more likely to fail you in the evaluations.
- Communicate ASAP with the project mentor if evaluation metrics are unclear.

**Blog**

- keep a regular journal of your experience as a student and blog at least once
  every 2 weeks.

## Proposal Instructions



Projects proposed by mentors are listed at our [issues page](https://github.com/orcasound/orcagsoc/issues).

Please title your proposal *[IssueNumber\_ProjectName\_YourName]*. You are free to use components from several projects ideas: select the number of the project you find closest to yours. Be realistic about the scope. You are also welcome to propose your own idea, but first discuss it on slack to ensure there will be mentors who can support it.

### How to write a great Proposal

Firstly, think about your choice of project carefully, you're going to be doing
it for a couple of months, so it's important that you choose something you're
going to enjoy. Once you've made your mind up:

1. Make sure you've thought about the project and understand what it entails.
2. Engage with the community early. The earlier you contact us the more feedback you will receive on your application. It may take time to review the draft proposals so feel free to ask on slack or GitHub whether your proposed path makes sense. Also open source code is often built in the open, so it is usual to obtain feedback on the public forums.
  
3. Don't be afraid to come up with original solutions to the problem.
4. Don't be afraid to give us lots of detail about how you would approach the project. But also be succinct and convey your ideas clearly. A picture or a link may worth a lot of words.

Overall, your application should make us believe that you are capable of
completing the project and delivering the functionality to our users. If you
aren't sure about anything, ask questions on slack, we're happy to advise you.

### How to estimate time needed for development
Get some familiarity with the orcasound repositories and data. Test existing functions, add missing details, fix code style. Do some research on the methods and tools you plan to use. Install the needed packages and build a plan of how they will work together. Write down
your algorithms in pseudo code. The better your research is and the better you
plan ahead the easier it will be to judge how long a given task will take. For
your time estimates you should also consider that you can do less stuff during
exams and try to be a bit conservative. Discuss the risks of the proposal and potential challenges. How do you intend to address them? If you have never done anything like
GSoC before you will tend to underestimate the time to complete a task. We know
that giving these estimates is not easy and that also professionals have
problems with it. Having a good plan, knowing its weak and strong points will
help a lot.

### Final Proposal

Your final proposal must be submitted to [GSoC](summerofcode.withgoogle.com) as
a PDF file, using [this template](https://github.com/orcasound/orcagsoc/blob/master/STUDENT-proposal-template.md). Your proposal should be named *[IssueNumber\_ProjectName\_YourName]* to make
identification easier for the mentors. To convert a draft that you have written
before into PDF you can use [Pandoc][Pandoc].

~~~
$ pandoc -f markdown -t pdf YYYY/proposals/your-project-name.md
~~~

[issues]: https://github.com/orcasound/orcagsoc/issues
[GSoC]: http://summerofcode.withgoogle.com/
[Pandoc]: http://pandoc.org/
