// Built-in educational starter packs. These are local data only.
//
// Computer science reference sources:
// - MDN Web Docs Glossary: https://developer.mozilla.org/en-US/docs/Glossary
// - MDN: How does the Internet work? https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work
//
// Pharmacy terminology reference sources:
// - FDA: Dosage Form and Route of Administration:
//   https://www.fda.gov/industry/data-standards/dosage-form-and-route-administration
// - NLM MeSH: Dosage Forms: https://meshb.nlm.nih.gov/record/ui?ui=D004304
// - NLM MeSH: Drug Administration Routes: https://meshb.nlm.nih.gov/record/ui?ui=D004333
// - NCI EVS/CDISC Glossary: https://evs.nci.nih.gov/ftp1/CDISC/Glossary/CDISC%20Glossary.html
//
// Pharmacy cards teach general vocabulary only. They intentionally contain
// no patient-specific treatment advice, dosing recommendations, or
// prescription shorthand.

export const STARTER_DECKS = [
  {
    key: "computer-science-basics",
    name: "Computer Science Basics",
    cards: [
      {
        front: "What is an algorithm?",
        back: "A defined sequence of steps for solving a problem or completing a task.",
      },
      {
        front: "What is a variable in programming?",
        back: "A named reference used to store or access a value in a program.",
      },
      {
        front: "What is a data type?",
        back: "A classification of data that describes what kind of value it is and which operations are appropriate for it.",
      },
      {
        front: "What is a function?",
        back: "A reusable unit of code that performs a task and may accept inputs and return a result.",
      },
      {
        front: "What is a conditional statement?",
        back: "A programming construct that chooses which code to run based on whether a condition is true or false.",
      },
      {
        front: "What is a loop?",
        back: "A control structure that repeats instructions while a condition holds or for a specified sequence of items.",
      },
      {
        front: "What is recursion?",
        back: "A technique where a function or procedure solves a problem by calling itself on smaller or simpler cases.",
      },
      {
        front: "What is a bug in software?",
        back: "An error or defect that causes software to behave incorrectly or unexpectedly.",
      },
      {
        front: "What is debugging?",
        back: "The process of locating, understanding, and correcting defects in software.",
      },
      {
        front: "What is an array?",
        back: "An ordered collection of elements, typically accessed by position or index.",
      },
      {
        front: "What is a linked list?",
        back: "A collection of nodes where each node stores data and a reference to another node in the list.",
      },
      {
        front: "What is a stack data structure?",
        back: "A collection that follows last in, first out (LIFO): the most recently added item is removed first.",
      },
      {
        front: "What is a queue data structure?",
        back: "A collection that commonly follows first in, first out (FIFO): the earliest added item is removed first.",
      },
      {
        front: "What is a hash table?",
        back: "A data structure that uses a hash function to map keys to locations for efficient lookup, insertion, and deletion on average.",
      },
      {
        front: "What is a tree data structure?",
        back: "A hierarchical structure of nodes connected by edges, often organized around a root node.",
      },
      {
        front: "What is binary search?",
        back: "A search algorithm for sorted data that repeatedly halves the remaining search range.",
      },
      {
        front: "What does Big O notation describe?",
        back: "How an algorithm's resource requirements grow as input size grows, often focusing on time or memory.",
      },
      {
        front: "What is a sorting algorithm?",
        back: "A procedure that rearranges items according to an ordering rule, such as ascending numeric order.",
      },
      {
        front: "What is a database?",
        back: "An organized collection of data designed to be stored, accessed, managed, and updated.",
      },
      {
        front: "What is a relational database?",
        back: "A database model that organizes data into tables of rows and columns, with relationships between tables.",
      },
      {
        front: "What is SQL commonly used for?",
        back: "Defining, querying, and modifying data in relational database systems.",
      },
      {
        front: "What is a database primary key?",
        back: "A column or set of columns used to uniquely identify each row in a table.",
      },
      {
        front: "What is an operating system?",
        back: "System software that manages computer hardware and provides common services for applications.",
      },
      {
        front: "What is a process in an operating system?",
        back: "A program instance being executed, with its own execution state and resources managed by the operating system.",
      },
      {
        front: "What is a computer network?",
        back: "A group of connected devices that can communicate and exchange data using agreed protocols.",
      },
    ],
  },
  {
    key: "pharmacy-terminology",
    name: "Pharmacy Terminology",
    cards: [
      {
        front: "What is a medication's active ingredient?",
        back: "The substance in a medicine responsible for its intended pharmacological effect.",
      },
      {
        front: "What is an excipient?",
        back: "An ingredient in a medicine other than the active ingredient, such as a substance used to help manufacture or deliver the product.",
      },
      {
        front: "What is a dosage form?",
        back: "The physical form in which a medicine is supplied, such as a tablet, capsule, solution, cream, or injection.",
      },
      {
        front: "What is a tablet?",
        back: "A solid dosage form, commonly made by compressing ingredients into a defined shape.",
      },
      {
        front: "What is a capsule?",
        back: "A dosage form in which medication is enclosed in a shell, often made from gelatin or another suitable material.",
      },
      {
        front: "What is a solution in pharmacy?",
        back: "A liquid preparation in which one or more substances are dissolved in a liquid solvent.",
      },
      {
        front: "What is a suspension?",
        back: "A liquid preparation containing dispersed solid particles that are not fully dissolved in the liquid.",
      },
      {
        front: "What is an emulsion?",
        back: "A preparation in which one liquid is dispersed as droplets in another liquid that it does not normally mix with.",
      },
      {
        front: "What is a topical dosage form?",
        back: "A preparation intended to be applied to a body surface, such as the skin or another specified surface.",
      },
      {
        front: "What is an extended-release dosage form?",
        back: "A formulation designed to release its active ingredient over a longer period than an immediate-release formulation.",
      },
      {
        front: "What does the oral route mean?",
        back: "Administration by mouth, with the medicine typically swallowed.",
      },
      {
        front: "What does the sublingual route mean?",
        back: "Administration under the tongue, where the medicine can be absorbed through tissues in that area.",
      },
      {
        front: "What does the buccal route mean?",
        back: "Administration against the inside of the cheek, allowing absorption through the oral mucosa.",
      },
      {
        front: "What does the topical route mean?",
        back: "Application to a body surface, commonly for a local effect; the intended site and product instructions matter.",
      },
      {
        front: "What does the transdermal route mean?",
        back: "Delivery through the skin, typically from a formulation designed to allow the medicine to enter systemic circulation.",
      },
      {
        front: "What does the inhalation route mean?",
        back: "Administration by breathing a medicine into the respiratory tract.",
      },
      {
        front: "What does the ophthalmic route mean?",
        back: "Administration to or into the eye.",
      },
      {
        front: "What does the otic route mean?",
        back: "Administration to or into the ear.",
      },
      {
        front: "What does the intravenous route mean?",
        back: "Administration directly into a vein.",
      },
      {
        front: "What does the intramuscular route mean?",
        back: "Administration into muscle tissue.",
      },
      {
        front: "What does the subcutaneous route mean?",
        back: "Administration into the tissue layer beneath the skin.",
      },
      {
        front: "What is pharmacology?",
        back: "The study of drugs and how they interact with living systems.",
      },
      {
        front: "What is pharmacokinetics?",
        back: "The study of how the body absorbs, distributes, metabolizes, and eliminates a drug.",
      },
      {
        front: "What is pharmacodynamics?",
        back: "The study of the biochemical and physiological effects of drugs and how those effects occur.",
      },
      {
        front: "What is an adverse drug reaction?",
        back: "A harmful and unintended response associated with the use of a medicine.",
      },
    ],
  },
];