document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to all HTML elements
    const min1Elem = document.getElementById('min1');
    const max1Elem = document.getElementById('max1');
    const min2Elem = document.getElementById('min2');
    const max2Elem = document.getElementById('max2');
    const generateBtn = document.getElementById('generate-btn');
    const pdfBtn = document.getElementById('pdf-btn');
    const newPageBtn = document.getElementById('new-page-btn');
    const worksheet = document.getElementById('worksheet');
    const infoBar = document.getElementById('info-bar');
    const pdfFontSizeElem = document.getElementById('pdf-font-size');

    let generatedProblems = [];

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generateSums);
    pdfBtn.addEventListener('click', generatePDF);
    newPageBtn.addEventListener('click', () => {
        worksheet.innerHTML = '';
        infoBar.textContent = '';
        generatedProblems = [];
    });

    // --- Main Function to Generate All Possible Sums ---
    function generateSums() {
        const min1 = parseInt(min1Elem.value);
        const max1 = parseInt(max1Elem.value);
        const min2 = parseInt(min2Elem.value);
        const max2 = parseInt(max2Elem.value);
        const randomizationLevel = document.querySelector('input[name="randomization"]:checked').value;

        if (min1 > max1 || min2 > max2) {
            alert("The 'From' value cannot be greater than the 'To' value in a range.");
            return;
        }

        worksheet.innerHTML = '';
        generatedProblems = [];
        let allPossibleProblems = [];

        // --- CORE LOGIC: Generate problems based on randomization level ---
        if (randomizationLevel === '1') { // Fully Sequential
            // Iterates through second range, then first range sequentially.
            for (let num2 = min2; num2 <= max2; num2++) {
                for (let num1 = min1; num1 <= max1; num1++) {
                    if (num1 >= num2) {
                        allPossibleProblems.push([num1, num2]);
                    }
                }
            }
        } else if (randomizationLevel === '2') { // Random First Number
            // Iterates through second range, but shuffles the first number for each block.
            for (let num2 = min2; num2 <= max2; num2++) {
                let blockOfFirstNumbers = [];
                for (let num1 = min1; num1 <= max1; num1++) {
                    if (num1 >= num2) {
                        blockOfFirstNumbers.push(num1);
                    }
                }
                shuffleArray(blockOfFirstNumbers);
                blockOfFirstNumbers.forEach(shuffledNum1 => {
                    allPossibleProblems.push([shuffledNum1, num2]);
                });
            }
        } else { // Level 3: Fully Random
            // Generates all possible pairs and then shuffles the entire list.
            for (let num1 = min1; num1 <= max1; num1++) {
                for (let num2 = min2; num2 <= max2; num2++) {
                    if (num1 >= num2) {
                        allPossibleProblems.push([num1, num2]);
                    }
                }
            }
            shuffleArray(allPossibleProblems);
        }

        infoBar.textContent = `Generated ${allPossibleProblems.length} unique problems.`;
        
        // --- Display the generated problems ---
        allPossibleProblems.forEach((problem, index) => {
            const [num1, num2] = problem;

            // Format the string with brackets and padding for alignment
            const problemString = `(${String(index + 1).padStart(2, ' ')})   ${num1} + ${num2} =`;
            generatedProblems.push(problemString);

            const sumDiv = document.createElement('div');
            sumDiv.classList.add('sum-item');
            sumDiv.textContent = problemString;
            worksheet.appendChild(sumDiv);
        });
    }

    // --- Function to Generate PDF --- (No changes needed)
    function generatePDF() {
        if (generatedProblems.length === 0) {
            alert("Please generate some sums first!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const fontSize = parseInt(pdfFontSizeElem.value) || 14;
        
        doc.setFontSize(fontSize);
        //doc.text("Addition Worksheet", 105, 15, null, null, "center");
        //doc.text("By Shuvam", 105, 15, null, null, "right");
        doc.text("Addition Worksheet", 105, 15, { align: "center" });
        doc.text("By Shuvam", 200, 15, { align: "right" });


        const startX = 20, startY = 30, lineHeight = fontSize / 2 + 2, columnWidth = 65;
        let x = startX, y = startY;

        generatedProblems.forEach((problem) => {
            doc.text(problem, x, y);
            y += lineHeight;

            if (y > 280) { // Page bottom
                y = startY;
                x += columnWidth;
                if (x > 150) { // Page right
                    doc.addPage();
                    x = startX;
                    y = startY;
                }
            }
        });

        doc.save("addition-worksheet.pdf");
    }

    // --- Helper function to shuffle an array ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});