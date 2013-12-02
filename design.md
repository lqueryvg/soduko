### (most recent thoughts first)

**some techniques**

single_position
  // only one cell in a group where a particular candidate value can occur
  for each group
    for each value
      found if only one cell in group has candidate value

single_candidate
  // only 1 candidate remaining in a cell

candidate_line
  // candidates for a value in a box lie on a line
  // therefore same value candidates on same line in other boxes can be deleted

double_pairs
  // a candidate value can only be in 2 cells in each of two boxes,
  // and the 4 cells form corners of a rectangle
  // therefore:
  // the two boxes must be in the same row/column, so the candidate value
  // can be deleted from the remaining box in that row/column

**underscore.js wrap() instead of Aspects**

Since I'm using underscore.js anyway, try underscore.js wrap function instead of Aspects.

**cell.set_value()**

Problem (redundant):
If cell set_value() doesn't set the cell value immediately, and instead
queues an action to perform at some point in the future, how
can we set the initial state of the grid ?
Can't just set the cell value in the view without the cell in the model
being set, because the model will still contain candidates in that cell
which will need to be considered and animated.

Solution (redundant): Initial set_value()'s should be a higher priority in the queue.
They might have special animation but they will still queue up some lower
priority row/box/column candidate searches.

Problem (redundant):
Want initial cell values to appear at same time, or at least close together;
at a shorter time interval than the default timer tick.

Solution (redundant):
Don't put the initial set_value()s in the queue at all.
Just call them at the start. They will in turn queue up future actions
to examine candidates.

Problem: cell.set_value() - which is in the model - is recursive.

- cell.set_value(n)
  - remove all candidates from cell
  - for each of cell's constraint groups
    - for each cell in group
      - remove candidate n
      - if 1 remaining candidate x, cell.set_value(x)

Solution:
Rather than recurse, this needs to queue up future actions, but model should
not know about the task queue; this should be moved to solver logic.  But this raises questions
about who does what.  I want to divorce the solver from the puzzle data.
Ideally there could be multiple, different solvers working on same model.
Candidates should be in the solver; different solvers might delete candidates
at different times.  So, all that remains in the model are cells and
constraint groups.   The candidate information
could (in theory) be shared by multiple solvers.  Or different solvers might
keep their own candidate information private. Would be nice to support both
approaches. The first action of the solver
would be to examine cell values and build up initial candidate lists.

Question:
Should the puzzle model check if cell set_value() calls are valid as per
constraint groups ?
Answer: Not sure. Even if a set_value() meets constraints it might still
not be valid move and can't be checked for sure unless the entire solution is known.

**Decoupled Task Queue**

Even better, task queue knows nothing about events or even the tasks
themselves. A separate loop in the view will control the timer interval
callbacks. The task queue itself will have methods:
* next() - return highest priority task (which can be an object of any kind, including a function)
* add_task(pri) - adds a task at the given priority
* replace_tasks(pri, [tasks]) - replaces all tasks at certain
Given that the "task" can be an object of any kind, perhaps the name should be more generic.
Call it "PriorityQueue" in which we put objects, not tasks.

**Task Queue**
Problem:
When solving, we must not recurse too deeply and block the event queue.
Also, must use a humanistic approach, exhausting easy techniques before trying
harder ones, and revisiting easy techniques whenever a known cell value has
been set.

Solution: Use a scheduler and a task queue.
The scheduler works on a timer interval (based on speed of animation).
For each "tick" it removes the top priority task from the queue, executes
it then yields, to be called back on the next tick.
If task queue is empty, solving has failed.
Tasks types have priorities.  E.g. (highest first)

1. Stop. Special task inserted at top queue to tell the scheduler to stop solving, e.g. final unknown cell has been set.
1. delete a candidate
1. set a cell value
   When a known cell value is set, add tasks for
   all relevant row/column/box candidate deletions then yield.
   By making candidate deletions higher priority than setting cell values,
   the solution should appear easier to understand when animated.
1. check single position (e.g. candidate "n" only appears in a single cell of a row)
1. etc.
1. etc.
1. etc.
1. most obscure technique
1. trial and error checks

Internally this could be implemented as an array of lists. The array is indexed by priority number. Each list is a queue of tasks for that priority.

Tasks may cause other tasks to be added or deleted from the task queue.
For example a task for an obscure technique might queue up scans of rows, columns and boxes, each of which might have it's own animation. If any of these discovers a value, it adds a task
to the "set value" queue and replaces all tasks of lower priority (than set value), including it's own queued tasks, with their default task types so that they can be re-checked when their turn comes around again.

Initially the queue will contain only "set value" tasks for the cells initially populated in the grid.

**Humans shelved for now**
When a value is set, we must know it is correct and also delete candidates
otherwise could end up with an invalid grid.
Therefore the solution needs to be known in advance if a human player
is to be involved. So, a full blown solver is required with ability to
determine puzzle type/complexity and possibly also a generator is needed to generate puzzles of suitable type (e.g. ones which resort to trial and error are no fun). So, for now I am shelving ideas of human player involvement until more progress has been made on the solver.

**Monads**
I've taken a massive diversion when looking into async logic. Callbacks took me towards Promises which took me to Monads and then on to Haskell. I expect I'll be back *much* later...

**Controller**
The puzzle solver algorithm now needs to move into the Controller logic and out of the model. This means that the model is gradually doing less and less. Ho hum.

**Event dispatcher**
The event dispatcher will take an event from the top of the event queue, execute it, then delay & repeat. Note that some events might need to be executed at the same time, e.g. two users updating different cells at the same time. This might tie in with the idea of having event queue priorities.

**Incorrect values:**
What should happen if a cell gets set to an incorrect value ? Which leads to the question: What constitutes an incorrect value ? A value which violates the puzzle's constraints? This isn't as easy as it appears; a value might not violate immediately obvious row, column or box constraints but could cause the puzzle to become unsolvable, and it might not be possible to know this without first trying to solve the entire puzzle.
The computer shouldn't ever try to enter a cell value unless it is certainly known (unless there's a bug). But a person might do it. This opens up a set of questions:
* Should the user be allowed to enter incorrect values, and if so how would they be visually represented and what would they do to the "game" (e.g. red text, time penalty, etc).
* Could prevent incorrect user entries via the interface, e.g. only allow cell entry from a list of available candidates for that cell, but this could still cause errors in the solution further down the line, leading partial/impossible solutions.

Surely the only option is to know the solution beforehand, so that user feedback can be given ?
Now I've stepped into territory I didn't really want to enter. I'm not particularly interested in the really deep nitty gritty of Sudoku puzzle generation and solving techniques, so for now I'll leave it there and assume that yes, the solution will have to be known, somehow and the problem of user interaction and error feedback would have to be solved at some point.

**Superceeded events:**
At the risk of getting sidetracked with regard to event queue priorites and multiple "actors" putting events on the queue... some types of events might nullify others. For example events to delete or investigate candidates in a cell would become pointless if another event comes along first and sets the cell's value.
Ideally the to-do list of events will only contain items which really need to be done, but that would involve some kind of event queue management whereby higher priority events automatically delete those other events which they superceed. The easier approach (which I will adopt for now) is to write events such that they don't fail if they have already been done, e.g. deleting a candidate doesn't fail if the candidate has already been deleted.


**Solver Event Queue:**
After adding code to use JQuery to hide column, row and box candidates (after a cell value is set) and seeing all candidates hide themselves at *exactly the same time*, the single threaded nature of the Javascript engine has caused pause for thought. The JQuery effect methods are all asynchronous, adding the requests onto a list of things to do and returning immediately. When the event queue gets processed, all these animations get started at pretty much the same instant in time.

My initial intention had been for the effects to happen one after the other. Looking at how to do this has opened up a whole area of investigation around topics such as concurrency, yielding, chaining & promises.
I'm now exploring the idea of using an event queue approach to solving the puzzle. The queue will contain a todo list of items to be changed (eg. cells to be set or candidates to be deleted) and things to be investigated. This is quite different from the more obvious recursive approach and has got me thinking:

* the event queue will operate on a timer delay so the individual animation steps can be seen
* certain types of events should take priority over others (see below)
* what about user interaction in between animation steps ?
* how about letting the user co-operate with the computer when solving the puzzle ?
* or how about letting the user compete against the computer ?
* or multiple users co-operating or competing against another ?

Example event priorities (highest priority first):
1. setting cell values
2. removing candidates
3. simple/common solving techniques
4. complex solving techniques

Much food for thought, but I need to get started with the event queue and the animation.

**Model, View and Aspects:**
I've so far managed to divorce the Soduko puzzle *model* from the *view*. The view knows about the model but the model is blissfully unaware of the view.
The only restrictions I have had to impose on the model are that each component in the model which is changeable in the view must have:
* a string "name" property which is returned by toString() and uniquely identifies the component
* a setter function which is called whenever the component's value is set or changed

The view uses Aspects to hook a wrapper function around the component's setter method, such that the wrapper gets called whenever the component in the model is changed. The wrapper function uses the model component's unique name to identify which element in the view needs to be updated.

