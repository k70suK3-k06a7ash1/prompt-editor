Vite React Application Generation System Prompt
Please generate a Vite React application that meets the following requirements.

Application Purpose
An application that extracts variables in the ${prop} format from a "system prompt" entered by the user, dynamically generates input fields corresponding to those variables, and allows the user to enter values. Based on the entered values, the final prompt will be reconstructed and displayed.

Pre-requirements
Language: TypeScript

Technology Stack
Framework: React (using Vite)

Styling: Tailwind CSS V4

Icons: Lucide React (if necessary)

Key Components and Features
App.tsx (Main Component)

Defines the main layout of the application.

Renders the PromptEditor component.

Uses Tailwind CSS extensively to build a clean and modern UI. Considers responsive design to ensure proper display on both mobile and desktop.

PromptEditor.tsx (Prompt Editing Component)

State Management:

originalPrompt: The original prompt string entered or imported by the user (e.g., "Hello, my name is ${name}. I am ${age} years old.").

variables: A list of variables extracted from originalPrompt (e.g., ['name', 'age']).

variableValues: A map of each variable name to its current value (e.g., { name: 'Taro', age: '30' }).

generatedPrompt: The final prompt string reconstructed based on variableValues.

UI Elements:

Prompt Input Area: A textarea element where the user can paste or type the system prompt. Initially, display an example prompt as a placeholder.

Dynamic Generation of Variable Input Fields:

Whenever originalPrompt changes, use a regular expression (e.g., /\$\{(\w+)\}/g) to extract variables in the ${prop} format and update the variables state.

Dynamically render an input type="text" field for each variable name based on the variables list.

Each input field will be controlled to update the corresponding variableValues state.

The label for each input field will be the variable name (e.g., "name").

Generated Prompt Display Area: A textarea or div element. Whenever variableValues changes, replace the variables in originalPrompt with their corresponding values and display the generatedPrompt.

"Reset Prompt" Button: Resets all input fields and the prompt to their initial state.

Logic:

Use a useEffect hook to extract variables and update the variables state when originalPrompt changes.

Use another useEffect hook to reconstruct generatedPrompt when originalPrompt or variableValues changes.

The variable extraction logic should handle duplicate variable names and include only unique variable names in the list.

Styling Instructions
Use Tailwind CSS extensively to build a modern and user-friendly interface.

Apply appropriate padding, margins, and rounded corners to input fields, buttons, and text areas.

Visually distinguish each section (prompt input, variable input, generated prompt).

Use the "Inter" font and ensure overall readable text size and contrast.

Code Structure
src/App.tsx

src/components/PromptEditor.tsx

Other Considerations
Error handling is not required.

Integration with external services like Firebase is not required.

Do not use alert() or confirm().

Based on this system prompt, please generate the complete and self-contained Vite React application code.