// export const mathQuestions = [

//   {
//     question: "Solve for x: $2x + 5 = 15$",
//     options: ["$x = 5$", "$x = 10$", "$x = 7.5$", "$x = 2.5$"],
//     correctAnswer: "$x = 5$",
//   },
//   {
//     question: "Solve for y: $3y - 7 = 11$",
//     options: ["$y = 6$", "$y = 3$", "$y = 18$", "$y = 4$"],
//     correctAnswer: "$y = 6$",
//   },
//   {
//     question: "Solve for z: $z / 4 + 3 = 5$",
//     options: ["$z = 8$", "$z = 2$", "$z = 12$", "$z = 32$"],
//     correctAnswer: "$z = 8$",
//   },

//   // Systems of Equations
//   {
//     question: "Solve for x and y: $x + y = 8, x - y = 2$",
//     options: ["$x = 5, y = 3$", "$x = 3, y = 5$", "$x = 6, y = 2$", "$x = 2, y = 6$"],
//     correctAnswer: "$x = 5, y = 3$",
//   },
//   {
//     question: "Solve for a and b: $2a + b = 7, a - b = -1$",
//     options: ["$a = 2, b = 3$", "$a = 3, b = 1$", "$a = 1, b = 5$", "$a = 4, b = -1$"],
//     correctAnswer: "$a = 2, b = 3$",
//   },
//   {
//     question: "Find the solution to the system: $y = 2x + 1, y = -x + 4$",
//     options: ["$(1, 3)$", "$(3, 1)$", "$(2, 5)$", "$(5, 2)$"],
//     correctAnswer: "$(1, 3)$",
//   },

//   // Statistics
//   {
//     question: "What is the variance of the following data set: $\{2, 4, 6\}$?",
//     options: ["$2$", "$4$", "$8$", "$2.67$"],
//     correctAnswer: "$2.67$",
//   },
//   {
//     question: "If a data set has a standard deviation of 5, what is its variance?",
//     options: ["$25$", "$10$", "$5$", "$sqrt(5)$"],
//     correctAnswer: "$25$",
//   },
//   {
//     question: "Which of the following is a measure of the spread of a data set?",
//     options: ["Variance", "Mean", "Median", "Mode"],
//     correctAnswer: "Variance",
//   },

//   // Calculus (Differentiation & Integration)
//   {
//     question: "What is the derivative of $f(x) = x^2$?",
//     options: ["$2x$", "$x$", "$x^2/2$", "$2$"],
//     correctAnswer: "$2x$",
//   },
//   {
//     question: "What is the derivative of $f(x) = 5x + 3$?",
//     options: ["$5$", "$3$", "$5x$", "$8$"],
//     correctAnswer: "$5$",
//   },
//   {
//     question: "What is the derivative of a constant?",
//     options: ["$0$", "$1$", "The constant itself", "$-1$"],
//     correctAnswer: "$0$",
//   },
//   {
//     question: "What is the integral of $f(x) = 3x^2$?",
//     options: ["$x^3 + C$", "$6x + C$", "$3x^3 + C$", "$x^2 + C$"],
//     correctAnswer: "$x^3 + C$",
//   },

//   // Probability
//   {
//     question: "What is the probability of getting heads when flipping a fair coin?",
//     options: ["$1/2$", "$1$", "$0$", "$1/4$"],
//     correctAnswer: "$1/2$",
//   },
//   {
//     question: "What is the probability of rolling a 6 on a standard six-sided die?",
//     options: ["$1/6$", "$1/3$", "$1/2$", "$1$"],
//     correctAnswer: "$1/6$",
//   },
// ];

export const webDevQuestions = [
  // HTML
  {
    question: "Which semantic HTML5 element is best for grouping related navigation links?",
    options: ["<nav>", "<section>", "<aside>", "<div>"],
    correctAnswer: "<nav>",
  },
  {
    question: "What is the primary purpose of the <article> tag in HTML5?",
    options: [
      "To define independent, self-contained content",
      "To group related blog posts",
      "To embed external content",
      "To create a new section in a document",
    ],
    correctAnswer: "To define independent, self-contained content",
  },
  {
    question: "Which HTML attribute is used to provide a hint for an input field's expected value?",
    options: ["placeholder", "hint", "suggestion", "pattern"],
    correctAnswer: "placeholder",
  },
  {
    question: "In HTML forms, what does the 'autocomplete' attribute control?",
    options: [
      "Whether the browser should automatically complete input values",
      "Whether the form should be submitted automatically",
      "Whether the input field is required",
      "Whether the form should validate inputs",
    ],
    correctAnswer: "Whether the browser should automatically complete input values",
  },
  {
    question: "Which HTML5 input type is specifically designed for entering email addresses?",
    options: ["email", "text", "url", "mail"],
    correctAnswer: "email",
  },
  {
    question: "What is the correct way to embed an SVG image directly into an HTML document?",
    options: ["<svg>...</svg>", "<img> with .svg src", "<embed>", "<object>"],
    correctAnswer: "<svg>...</svg>",
  },
  {
    question: "Which HTML attribute is used to specify a unique identifier for an element?",
    options: ["id", "class", "name", "data-id"],
    correctAnswer: "id",
  },
  {
    question: "What is the purpose of the <meta charset='UTF-8'> tag in HTML?",
    options: [
      "To declare the character encoding of the document",
      "To set the document's language",
      "To define keywords for search engines",
      "To link to an external stylesheet",
    ],
    correctAnswer: "To declare the character encoding of the document",
  },
  {
    question: "Which HTML element is used to define important text?",
    options: ["<strong>", "<b>", "<em>", "<i>"],
    correctAnswer: "<strong>",
  },
  {
    question: "What is the correct HTML for creating a hyperlink to an email address?",
    options: [
      "<a href='mailto:a@example.com'>",
      "<a email='a@example.com'>",
      "<link href='a@example.com'>",
      "<mail to='a@example.com'>",
    ],
    correctAnswer: "<a href='mailto:a@example.com'>",
  },
  {
    question: "Which HTML element is used to define a client-side image map?",
    options: ["<map>", "<area>", "<image-map>", "<canvas>"],
    correctAnswer: "<map>",
  },
  {
    question: "What is the purpose of the 'defer' attribute in a <script> tag?",
    options: [
      "To execute the script after the document has been parsed",
      "To load the script asynchronously",
      "To prevent the script from executing",
      "To execute the script immediately",
    ],
    correctAnswer: "To execute the script after the document has been parsed",
  },
  {
    question: "Which HTML element is used to define preformatted text?",
    options: ["<pre>", "<p>", "<code>", "<xmp>"],
    correctAnswer: "<pre>",
  },
  {
    question: "What is the correct HTML for adding a background image?",
    options: [
      "<body style='background-image:url(bg.png)'>",
      "<background img='bg.png'>",
      "<img src='bg.png' background>",
      "<body bg='bg.png'>",
    ],
    correctAnswer: "<body style='background-image:url(bg.png)'>",
  },
  {
    question: "Which HTML element is used to specify a footer for a document or section?",
    options: ["<footer>", "<bottom>", "<section>", "<div>"],
    correctAnswer: "<footer>",
  },
  {
    question: "What is the purpose of the <figcaption> element?",
    options: [
      "To provide a caption for a <figure> element",
      "To define a figure in a document",
      "To group images together",
      "To display a mathematical formula",
    ],
    correctAnswer: "To provide a caption for a <figure> element",
  },
  {
    question: "Which HTML attribute specifies the relationship between the current document and the linked document?",
    options: ["rel", "type", "href", "media"],
    correctAnswer: "rel",
  },
  {
    question: "What is the correct HTML for creating a dropdown list?",
    options: ["<select>", "<list>", "<dropdown>", "<input type='dropdown'>"],
    correctAnswer: "<select>",
  },
  {
    question: "Which HTML element is used to define a block quotation?",
    options: ["<blockquote>", "<q>", "<cite>", "<pre>"],
    correctAnswer: "<blockquote>",
  },
  {
    question: "What is the purpose of the 'async' attribute in a <script> tag?",
    options: [
      "To load the script asynchronously without blocking HTML parsing",
      "To execute the script after the document has been parsed",
      "To prevent the script from executing",
      "To execute the script immediately",
    ],
    correctAnswer: "To load the script asynchronously without blocking HTML parsing",
  },

  // CSS
  {
    question: "Which CSS property is used to control the order of flexible items in a flex container?",
    options: ["order", "flex-order", "align-items", "justify-content"],
    correctAnswer: "order",
  },
  {
    question: "What is the CSS 'box model' primarily composed of?",
    options: ["Content, Padding, Border, Margin", "Height, Width, Color, Font", "Text, Images, Links, Tables", "Divs, Spans, Paragraphs, Headings"],
    correctAnswer: "Content, Padding, Border, Margin",
  },
  {
    question: "Which CSS property is used to create space between an element's border and its content?",
    options: ["padding", "margin", "spacing", "border-spacing"],
    correctAnswer: "padding",
  },
  {
    question: "What does the 'em' unit represent in CSS?",
    options: [
      "The font size of the parent element",
      "The default font size of the browser",
      "A fixed pixel value",
      "A percentage of the viewport width",
    ],
    correctAnswer: "The font size of the parent element",
  },
  {
    question: "Which CSS property is used to make text italic?",
    options: ["font-style: italic;", "text-style: italic;", "font-weight: italic;", "italic: true;"],
    correctAnswer: "font-style: italic;",
  },
  {
    question: "How do you apply a style to all <p> elements with the class 'intro'?",
    options: ["p.intro", ".intro p", "p .intro", "#intro p"],
    correctAnswer: "p.intro",
  },
  {
    question: "What is the purpose of the 'float' property in CSS?",
    options: [
      "To position an element to the left or right, allowing other elements to wrap around it",
      "To make an element hover",
      "To change the element's opacity",
      "To animate an element",
    ],
    correctAnswer: "To position an element to the left or right, allowing other elements to wrap around it",
  },
  {
    question: "Which CSS property is used to specify the type of cursor to be displayed?",
    options: ["cursor", "pointer", "mouse", "display"],
    correctAnswer: "cursor",
  },
  {
    question: "What does 'display: flex;' do in CSS?",
    options: [
      "It makes an element a flex container, enabling flexbox layout for its direct children",
      "It hides the element from view",
      "It makes the element take up full width",
      "It aligns items to the center",
    ],
    correctAnswer: "It makes an element a flex container, enabling flexbox layout for its direct children",
  },
  {
    question: "Which CSS property is used to control the space between characters?",
    options: ["letter-spacing", "word-spacing", "line-height", "text-indent"],
    correctAnswer: "letter-spacing",
  },
  {
    question: "What is the purpose of the 'position: absolute;' property?",
    options: [
      "To position an element relative to its closest positioned ancestor",
      "To position an element relative to its normal position",
      "To keep an element in the same position even when the page scrolls",
      "To position an element relative to the viewport",
    ],
    correctAnswer: "To position an element relative to its closest positioned ancestor",
  },
  {
    question: "Which CSS property is used to set the transparency of an element?",
    options: ["opacity", "visibility", "display", "transparent"],
    correctAnswer: "opacity",
  },
  {
    question: "What does 'media queries' allow you to do in CSS?",
    options: [
      "Apply different styles based on device characteristics (e.g., screen width)",
      "Embed media files into the stylesheet",
      "Query a database for styling information",
      "Create animations",
    ],
    correctAnswer: "Apply different styles based on device characteristics (e.g., screen width)",
  },
  {
    question: "Which CSS property is used to add shadows to text?",
    options: ["text-shadow", "box-shadow", "shadow", "font-shadow"],
    correctAnswer: "text-shadow",
  },
  {
    question: "What is the purpose of the 'overflow' property in CSS?",
    options: [
      "To control what happens to content that overflows an element's box",
      "To make an element scrollable",
      "To hide an element",
      "To change the element's size",
    ],
    correctAnswer: "To control what happens to content that overflows an element's box",
  },
  {
    question: "Which CSS property is used to specify the order of grid items in a grid container?",
    options: ["grid-column-order", "order", "grid-area", "grid-row-order"],
    correctAnswer: "order",
  },
  {
    question: "What is the difference between 'visibility: hidden;' and 'display: none;'?",
    options: [
      "hidden hides element but takes space, none hides and removes space",
      "none hides element but takes space, hidden hides and removes space",
      "They are identical in behavior",
      "hidden is for text, none is for images",
    ],
    correctAnswer: "hidden hides element but takes space, none hides and removes space",
  },
  {
    question: "Which CSS property is used to create rounded corners on an element?",
    options: ["border-radius", "corner-radius", "border-curve", "round-border"],
    correctAnswer: "border-radius",
  },
  {
    question: "What does the 'calc()' CSS function do?",
    options: [
      "Performs calculations to determine CSS property values",
      "Calculates the sum of all element values",
      "Converts units of measurement",
      "Defines a custom function",
    ],
    correctAnswer: "Performs calculations to determine CSS property values",
  },
  {
    question: "Which CSS property is used to define the alignment of items along the main axis in a flex container?",
    options: ["justify-content", "align-items", "align-content", "flex-direction"],
    correctAnswer: "justify-content",
  },

  // JavaScript
  {
    question: "What is the correct way to declare a constant variable in JavaScript?",
    options: ["const x = 10;", "let x = 10;", "var x = 10;", "constant x = 10;"],
    correctAnswer: "const x = 10;",
  },
  {
    question: "Which operator performs strict equality comparison without type coercion?",
    options: ["===", "==", "=", "!="],
    correctAnswer: "===",
  },
  {
    question: "How do you write an 'if/else if/else' statement in JavaScript?",
    options: [
      "if (condition) { } else if (condition) { } else { }",
      "if condition then else if condition then else",
      "if (condition) then else if (condition) then else",
      "if condition { } else if condition { } else { }",
    ],
    correctAnswer: "if (condition) { } else if (condition) { } else { }",
  },
  {
    question: "What is the logical AND operator in JavaScript?",
    options: ["&&", "||", "!", "&"],
    correctAnswer: "&&",
  },
  {
    question: "What is the result of `5 + '5'` in JavaScript?",
    options: ["'55'", "10", "Error", "Undefined"],
    correctAnswer: "'55'",
  },
  {
    question: "Which keyword is used to exit a loop or a switch statement?",
    options: ["break", "continue", "return", "exit"],
    correctAnswer: "break",
  },
  {
    question: "What is the purpose of the 'continue' statement in a loop?",
    options: [
      "To skip the current iteration and proceed to the next one",
      "To exit the loop entirely",
      "To restart the loop from the beginning",
      "To pause the loop",
    ],
    correctAnswer: "To skip the current iteration and proceed to the next one",
  },
  {
    question: "Which JavaScript data type represents a single value that is not yet defined?",
    options: ["undefined", "null", "NaN", "void"],
    correctAnswer: "undefined",
  },
  {
    question: "What is the correct way to check if a variable 'x' is not equal to 'y'?",
    options: ["x !== y", "x != y", "x <> y", "x is not y"],
    correctAnswer: "x !== y",
  },
  {
    question: "What is the purpose of the 'typeof' operator in JavaScript?",
    options: [
      "To determine the data type of a variable",
      "To check if a variable is defined",
      "To convert a variable to a string",
      "To compare two variables",
    ],
    correctAnswer: "To determine the data type of a variable",
  },
];