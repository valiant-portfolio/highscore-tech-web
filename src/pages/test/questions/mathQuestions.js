export const mathQuestions = [

  {
    question: "Solve for x: $2x + 5 = 15$",
    options: ["$x = 5$", "$x = 10$", "$x = 7.5$", "$x = 2.5$"],
    correctAnswer: "$x = 5$",
  },
  {
    question: "Solve for y: $3y - 7 = 11$",
    options: ["$y = 6$", "$y = 3$", "$y = 18$", "$y = 4$"],
    correctAnswer: "$y = 6$",
  },
  {
    question: "Solve for z: $z / 4 + 3 = 5$",
    options: ["$z = 8$", "$z = 2$", "$z = 12$", "$z = 32$"],
    correctAnswer: "$z = 8$",
  },

  // Systems of Equations
  {
    question: "Solve for x and y: $x + y = 8, x - y = 2$",
    options: ["$x = 5, y = 3$", "$x = 3, y = 5$", "$x = 6, y = 2$", "$x = 2, y = 6$"],
    correctAnswer: "$x = 5, y = 3$",
  },
  {
    question: "Solve for a and b: $2a + b = 7, a - b = -1$",
    options: ["$a = 2, b = 3$", "$a = 3, b = 1$", "$a = 1, b = 5$", "$a = 4, b = -1$"],
    correctAnswer: "$a = 2, b = 3$",
  },
  {
    question: "Find the solution to the system: $y = 2x + 1, y = -x + 4$",
    options: ["$(1, 3)$", "$(3, 1)$", "$(2, 5)$", "$(5, 2)$"],
    correctAnswer: "$(1, 3)$",
  },

  // Statistics
  {
    question: "What is the variance of the following data set: $\{2, 4, 6\}$?",
    options: ["$2$", "$4$", "$8$", "$2.67$"],
    correctAnswer: "$2.67$",
  },
  {
    question: "If a data set has a standard deviation of 5, what is its variance?",
    options: ["$25$", "$10$", "$5$", "$sqrt(5)$"],
    correctAnswer: "$25$",
  },
  {
    question: "Which of the following is a measure of the spread of a data set?",
    options: ["Variance", "Mean", "Median", "Mode"],
    correctAnswer: "Variance",
  },

  // Calculus (Differentiation & Integration)
  {
    question: "What is the derivative of $f(x) = x^2$?",
    options: ["$2x$", "$x$", "$x^2/2$", "$2$"],
    correctAnswer: "$2x$",
  },
  {
    question: "What is the derivative of $f(x) = 5x + 3$?",
    options: ["$5$", "$3$", "$5x$", "$8$"],
    correctAnswer: "$5$",
  },
  {
    question: "What is the derivative of a constant?",
    options: ["$0$", "$1$", "The constant itself", "$-1$"],
    correctAnswer: "$0$",
  },
  {
    question: "What is the integral of $f(x) = 3x^2$?",
    options: ["$x^3 + C$", "$6x + C$", "$3x^3 + C$", "$x^2 + C$"],
    correctAnswer: "$x^3 + C$",
  },

  // Probability
  {
    question: "What is the probability of getting heads when flipping a fair coin?",
    options: ["$1/2$", "$1$", "$0$", "$1/4$"],
    correctAnswer: "$1/2$",
  },
  {
    question: "What is the probability of rolling a 6 on a standard six-sided die?",
    options: ["$1/6$", "$1/3$", "$1/2$", "$1$"],
    correctAnswer: "$1/6$",
  },
];

export const webDevQuestions = [
  // HTML
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "Home Tool Markup Language",
      "Hyperlinks and Text Markup Language",
      "Hyper Tool Markup Language",
    ],
    correctAnswer: "Hyper Text Markup Language",
  },
  {
    question: "Which HTML tag is used to define an unordered list?",
    options: ["<ol>", "<ul>", "<li>", "<list>"],
    correctAnswer: "<ul>",
  },
  {
    question: "What is the correct HTML element for inserting a line break?",
    options: ["<break>", "<lb>", "<br>", "<lnbr>"],
    correctAnswer: "<br>",
  },
  {
    question:
      "Which HTML element is used to specify a header for a document or section?",
    options: ["<head>", "<header>", "<h1>", "<top>"],
    correctAnswer: "<header>",
  },
  {
    question:
      "In HTML, which attribute is used to specify that an input field must be filled out?",
    options: ["required", "placeholder", "validate", "mustfill"],
    correctAnswer: "required",
  },
  {
    question: "What does the <a> tag define?",
    options: ["A hyperlink", "An anchor", "An article", "An abbreviation"],
    correctAnswer: "A hyperlink",
  },
  {
    question:
      "Which attribute specifies the URL of the page the link goes to?",
    options: ["src", "href", "link", "url"],
    correctAnswer: "href",
  },
  {
    question: "How can you open a link in a new tab/browser window?",
    options: [
      'target="_blank"',
      'target="_new"',
      'target="_tab"',
      'target="_window"',
    ],
    correctAnswer: 'target="_blank"',
  },
  {
    question: "Which tag is used to embed an image in an HTML page?",
    options: ["<img>", "<image>", "<pic>", "<picture>"],
    correctAnswer: "<img>",
  },
  {
    question: "Which attribute provides alternative text for an image?",
    options: ["alt", "title", "src", "longdesc"],
    correctAnswer: "alt",
  },
  {
    question: "What is the purpose of the <div> tag?",
    options: [
      "To define a division or a section",
      "To display data",
      "To replace a paragraph",
      "To decorate a page",
    ],
    correctAnswer: "To define a division or a section",
  },
  {
    question: "What is the correct HTML for creating a checkbox?",
    options: [
      '<input type="checkbox">',
      '<checkbox>',
      '<input type="check">',
      '<check>',
    ],
    correctAnswer: '<input type="checkbox">',
  },
  {
    question: "Which tag defines the title of a document?",
    options: ["<title>", "<head>", "<meta>", "<body>"],
    correctAnswer: "<title>",
  },
  {
    question: "Which tag is used to define a table?",
    options: ["<table>", "<tab>", "<tr>", "<td>"],
    correctAnswer: "<table>",
  },
  {
    question: "Which tag is used to define a table row?",
    options: ["<tr>", "<td>", "<th>", "<table>"],
    correctAnswer: "<tr>",
  },
  {
    question: "Which tag is used to define an HTML form for user input?",
    options: ["<form>", "<input>", "<form-group>", "<fieldset>"],
    correctAnswer: "<form>",
  },
  {
    question: "What does the <label> tag do?",
    options: [
      "Defines a label for an <input> element",
      "Defines a section of text",
      "Highlights text",
      "Creates a line break",
    ],
    correctAnswer: "Defines a label for an <input> element",
  },
  {
    question: "What is the correct HTML for creating a submit button?",
    options: [
      '<input type="submit" value="Submit">',
      '<button type="submit">Submit</button>',
      '<input type="button" value="Submit">',
      "All of the above",
    ],
    correctAnswer: "All of the above",
  },
  {
    question: "Which tag is used to define a multi-line text input control?",
    options: [
      "<textarea>",
      "<input type='textarea'>",
      "<text>",
      "<multiline>",
    ],
    correctAnswer: "<textarea>",
  },
  {
    question: "What is the purpose of the <!DOCTYPE html> declaration?",
    options: [
      "It tells the browser that the document is an HTML5 document",
      "It's a comment",
      "It defines the character set",
      "It links to a stylesheet",
    ],
    correctAnswer: "It tells the browser that the document is an HTML5 document",
  },

  // CSS
  {
    question: "What does CSS stand for?",
    options: [
      "Creative Style Sheets",
      "Computer Style Sheets",
      "Cascading Style Sheets",
      "Colorful Style Sheets",
    ],
    correctAnswer: "Cascading Style Sheets",
  },
  {
    question: "Which HTML attribute is used to define inline styles?",
    options: ["style", "class", "styles", "font"],
    correctAnswer: "style",
  },
  {
    question: "Which is the correct CSS syntax?",
    options: [
      "body:color=black;",
      "{body;color:black;}",
      "body {color: black;}",
      "body-color: black;",
    ],
    correctAnswer: "body {color: black;}",
  },
  {
    question: "How do you insert a comment in a CSS file?",
    options: [
      "// this is a comment",
      "<!-- this is a comment -->",
      "/* this is a comment */",
      "' this is a comment",
    ],
    correctAnswer: "/* this is a comment */",
  },
  {
    question: "Which CSS property controls the text size?",
    options: ["font-style", "text-size", "font-size", "text-style"],
    correctAnswer: "font-size",
  },
  {
    question: 'How do you select an element with id "demo"?',
    options: ["#demo", ".demo", "demo", "*demo"],
    correctAnswer: "#demo",
  },
  {
    question: 'How do you select elements with class name "test"?',
    options: [".test", "#test", "test", "*test"],
    correctAnswer: ".test",
  },
  {
    question: "How do you group selectors?",
    options: [
      "Separate each selector with a comma",
      "Separate each selector with a plus sign",
      "Separate each selector with a space",
      "Separate each selector with a dot",
    ],
    correctAnswer: "Separate each selector with a comma",
  },
  {
    question: "What is the default value of the `position` property?",
    options: ["static", "relative", "absolute", "fixed"],
    correctAnswer: "static",
  },
  {
    question: "Which property is used to change the background color?",
    options: ["background-color", "color", "bgcolor", "background"],
    correctAnswer: "background-color",
  },
  {
    question: "Which property is used to change the font of an element?",
    options: ["font-family", "font-style", "font-weight", "font-size"],
    correctAnswer: "font-family",
  },
  {
    question: "Which property is used to make the text bold?",
    options: ["font-weight", "font-style", "text-decoration", "font-family"],
    correctAnswer: "font-weight",
  },
  {
    question: "How do you make each word in a text start with a capital letter?",
    options: [
      "text-transform: capitalize",
      "text-transform: uppercase",
      "text-style: capitalize",
      "font-transform: capitalize",
    ],
    correctAnswer: "text-transform: capitalize",
  },
  {
    question: "Which property is used to set the spacing between lines of text?",
    options: ["line-height", "letter-spacing", "word-spacing", "spacing"],
    correctAnswer: "line-height",
  },
  {
    question: "What does the `display: none;` property do?",
    options: [
      "Hides the element",
      "Deletes the element",
      "Shows the element",
      "Styles the element",
    ],
    correctAnswer: "Hides the element",
  },
  {
    question: "What is the difference between padding and margin?",
    options: [
      "Padding is inside the border, margin is outside",
      "Margin is inside the border, padding is outside",
      "They are the same",
      "Padding is for text, margin is for images",
    ],
    correctAnswer: "Padding is inside the border, margin is outside",
  },
  {
    question: "Which property is used to set the border of an element?",
    options: ["border", "border-style", "border-width", "All of the above"],
    correctAnswer: "All of the above",
  },
  {
    question: "What does the `box-sizing: border-box;` property do?",
    options: [
      "Includes padding and border in the element's total width and height",
      "Excludes padding and border from the element's total width and height",
      "Adds a border around the box",
      "Changes the box shape",
    ],
    correctAnswer:
      "Includes padding and border in the element's total width and height",
  },
  {
    question: "Which property controls the stacking order of elements?",
    options: ["z-index", "position", "layer", "order"],
    correctAnswer: "z-index",
  },


  // JavaScript
  {
    question: "How do you declare a JavaScript variable?",
    options: ["v carName;", "variable carName;", "var carName;"],
    correctAnswer: "var carName;",
  },
  {
    question: "Which operator is used to assign a value to a variable?",
    options: ["*", "-", "=", "x"],
    correctAnswer: "=",
  },
  {
    question: "How do you write an if statement in JavaScript?",
    options: ["if i = 5 then", "if i == 5 then", "if (i == 5)", "if i = 5"],
    correctAnswer: "if (i == 5)",
  },
  {
    question:
      "How to write an if statement for executing some code if 'i' is NOT equal to 5?",
    options: ["if (i != 5)", "if i <> 5", "if (i =! 5)", "if i not = 5"],
    correctAnswer: "if (i != 5)",
  },
  {
    question:
      "What is the result of the string concatenation: 'Hello' + ' ' + 'World'?",
    options: ["Hello World", "HelloWorld", "Hello  World", "Error"],
    correctAnswer: "Hello World",
  },

  {
    question: "How can you add a comment in a JavaScript?",
    options: [
      "//This is a comment",
      "<!--This is a comment-->",
      "'This is a comment",
      "**This is a comment**",
    ],
    correctAnswer: "//This is a comment",
  },
];