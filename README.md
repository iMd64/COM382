# MicroSYS: 8051 Microprocessor Interactive Study Guide

A comprehensive, interactive Single Page Application (SPA) designed to make learning the Intel 8051 microcontroller architecture intuitive and visual. Built for Computer Engineering students and embedded systems enthusiasts, this tool transforms static textbook concepts into dynamic, clickable simulations.

## 🚀 Features

This application covers a full semester's worth of microprocessor concepts, divided into easily navigable weekly modules:

* **Interactive 8051 Pinout Explorer:** Hover over the classic 40-pin DIP package to instantly view primary and alternate pin functions (e.g., multiplexed AD0-AD7, RXD/TXD, Interrupts).
* **Hardware & Bus Simulators:** * Step-by-step Opcode Fetch Cycle animator.
    * Interactive ALE Multiplexing and Address Decoding (using 74LS138).
* **Assembly Execution Steppers:** Watch data move through registers and memory in real-time with step-by-step execution for instructions like `MOVX`, `DJNZ` nested loops, and Stack operations (`PUSH`/`POP`/`CALL`).
* **Live Calculators:**
    * **Timing:** Machine cycle and delay loop calculators based on custom crystal frequencies (MHz).
    * **Memory:** Chip capacity calculators based on address and data bus widths.
    * **Branching:** Hexadecimal short jump relative offset calculator.
* **Peripheral Configurators:** Interactive UI for toggling TMOD (Timer Mode) and IE (Interrupt Enable) register bits to see hardware outcomes instantly.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Styling:** Tailwind CSS (via CDN) and custom CSS variables for a sleek, dark-mode UI.
* **Architecture:** Single Page Application (SPA) with DOM-manipulation routing. Zero build steps required.

## 💻 Getting Started

This project is completely client-side and requires no dependencies, package managers, or build tools.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/iMd64/COM382.git](https://github.com/iMd64/COM382.git)
    ```
2.  **Open the application:**
    Simply double-click the `index.html` file to open it in your preferred web browser, or serve it via a local live server (like VS Code's Live Server extension).

## 📂 Project Structure

All logic, styling, and markup are currently combined for easy portability. 

* **UI/Layout:** Top navigation for weekly modules, dynamic sidebars for section routing.
* **State Management:** Vanilla JS handles the state of the simulators (like the Timer Mode 2 auto-reload and the Stack LIFO logic).
* **Failsafes:** Built with optional chaining (`?.`) and safe DOM queries to ensure the application remains stable even if UI components are reorganized.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/iMd64/COM382/issues).
