document.addEventListener('DOMContentLoaded', () => {

    // --- Get all necessary DOM elements ---
    const problemTypeRadios = document.querySelectorAll('input[name="problemType"]');
    const zeroRemainderInputs = document.getElementById('zero-remainder-inputs');
    const mixedDecimalInputs = document.getElementById('mixed-decimal-inputs');
    const generateBtn = document.getElementById('generate-btn');
    const answerToggleBtn = document.getElementById('answer-toggle-btn');
    const pdfBtn = document.getElementById('pdf-btn');
    const worksheet = document.getElementById('worksheet');
    const infoBar = document.getElementById('info-bar');
    const pdfFontSizeElem = document.getElementById('pdf-font-size');

    let generatedProblems = [];

    // --- Event Listeners ---
    problemTypeRadios.forEach(radio => radio.addEventListener('change', updateInputVisibility));
    generateBtn.addEventListener('click', generateProblems);
    answerToggleBtn.addEventListener('click', toggleAnswers);
    pdfBtn.addEventListener('click', generatePDF);
    
    function updateInputVisibility() {
        if (document.querySelector('input[name="problemType"]:checked').value === 'zero') {
            zeroRemainderInputs.classList.remove('hidden');
            mixedDecimalInputs.classList.add('hidden');
        } else {
            zeroRemainderInputs.classList.add('hidden');
            mixedDecimalInputs.classList.remove('hidden');
        }
    }

    function toggleAnswers() {
        const answers = document.querySelectorAll('.answer-text');
        if (answers.length === 0) return;
        const isHidden = answers[0].style.display === 'none' || answers[0].style.display === '';
        answers.forEach(answer => answer.style.display = isHidden ? 'inline-block' : 'none');
        answerToggleBtn.textContent = isHidden ? 'Hide Answers' : 'Show Answers';
    }

    // --- Core Problem Generation Logic ---
    function generateProblems() {
        worksheet.innerHTML = '';
        generatedProblems = [];
        answerToggleBtn.textContent = 'Show Answers';
        
        const problemType = document.querySelector('input[name="problemType"]:checked').value;
        const randomizationLevel = document.querySelector('input[name="randomization"]:checked').value;
        let allPossibleProblems = [];
        
        let denMin, denMax, numMin, numMax, ansMin, ansMax;
        if (problemType === 'zero') {
            denMin = parseInt(document.getElementById('den-zero-min').value);
            denMax = parseInt(document.getElementById('den-zero-max').value);
            ansMin = parseInt(document.getElementById('ans-zero-min').value);
            ansMax = parseInt(document.getElementById('ans-zero-max').value);
        } else {
            numMin = parseInt(document.getElementById('num-mixed-min').value);
            numMax = parseInt(document.getElementById('num-mixed-max').value);
            denMin = parseInt(document.getElementById('den-mixed-min').value);
            denMax = parseInt(document.getElementById('den-mixed-max').value);
        }

        // --- GENERATION LOGIC ---
        if (randomizationLevel === '1') {
            for (let den = denMin; den <= denMax; den++) {
                for (let num = numMin ?? (ansMin * den); num <= (numMax ?? (ansMax * den)); num++) {
                    if (problemType === 'zero' && den !== 0 && (num % den !== 0 || num / den < ansMin)) continue;
                    allPossibleProblems.push({ num, den });
                }
            }
        } else if (randomizationLevel === '2') {
            for (let den = denMin; den <= denMax; den++) {
                let numeratorBlock = [];
                for (let num = numMin ?? (ansMin * den); num <= (numMax ?? (ansMax * den)); num++) {
                    if (problemType === 'zero' && den !== 0 && (num % den !== 0 || num / den < ansMin)) continue;
                    numeratorBlock.push(num);
                }
                shuffleArray(numeratorBlock);
                numeratorBlock.forEach(shuffledNum => {
                    allPossibleProblems.push({ num: shuffledNum, den });
                });
            }
        } else {
             for (let den = denMin; den <= denMax; den++) {
                for (let num = numMin ?? (ansMin * den); num <= (numMax ?? (ansMax * den)); num++) {
                    if (problemType === 'zero' && den !== 0 && (num % den !== 0 || num / den < ansMin)) continue;
                    allPossibleProblems.push({ num, den });
                }
            }
            shuffleArray(allPossibleProblems);
        }
        
        infoBar.textContent = `Generated ${allPossibleProblems.length} unique problems.`;
        
        // --- DISPLAY LOGIC ---
        allPossibleProblems.forEach((p, index) => {
            const problemString = `(${index + 1})  ${p.num} ÷ ${p.den} = `;
            generatedProblems.push(problemString);

            const container = document.createElement('div');
            container.classList.add('problem-container');
            const problemSpan = document.createElement('span');
            problemSpan.classList.add('problem-text');
            problemSpan.textContent = problemString;
            const answerSpan = document.createElement('span');
            answerSpan.classList.add('answer-text');

            if (problemType === 'mixed') {
                const latexString = toMixedNumberLaTeX(p.num, p.den);
                answerSpan.textContent = `\\(${latexString}\\)`;
            } else if (problemType === 'decimal') {
                if (p.den === 0) {
                    answerSpan.textContent = p.num === 0 ? "Indeterminate" : "Undefined";
                } else {
                    answerSpan.textContent = (p.num / p.den).toFixed(2);
                }
            } else { // 'zero' remainder
                if (p.den === 0) {
                    answerSpan.textContent = p.num === 0 ? "Indeterminate" : "Undefined";
                } else {
                    answerSpan.textContent = (p.num / p.den).toString();
                }
            }

            container.appendChild(problemSpan);
            container.appendChild(answerSpan);
            worksheet.appendChild(container);
        });

        if (window.MathJax) {
            window.MathJax.typesetPromise([worksheet]).catch((err) => console.error('MathJax processing error:', err));
        }
    }

    // --- PDF Generation ---
    function generatePDF() {
        if (generatedProblems.length === 0) {
            alert("Please generate some problems first!");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const fontSize = parseInt(pdfFontSizeElem.value) || 16;
        doc.setFontSize(fontSize);
        doc.text("Division Worksheet", 105, 15, null, null, "center");
        const startX = 20, startY = 30, lineHeight = fontSize / 2 + 3, columnWidth = 70;
        let x = startX, y = startY;
        generatedProblems.forEach((problem) => {
            doc.text(problem, x, y);
            y += lineHeight;
            if (y > 280) { // Page bottom
                y = startY;
                x += columnWidth;
                if (x > 160) { // Page right
                    doc.addPage();
                    x = startX;
                    y = startY;
                }
            }
        });
        doc.save("division-worksheet.pdf");
    }

    // --- Helper Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    function toMixedNumberLaTeX(num, den) {
        // Handle division by zero cases first
        if (den === 0) {
            return num === 0 ? "\\text{Indeterminate}" : "\\text{Undefined}";
        }
        if (num === 0) return "0";
        
        const whole = Math.floor(num / den);
        const remainder = num % den;
        if (remainder === 0) return whole.toString();
        if (whole === 0) return `\\frac{${remainder}}{${den}}`;
        return `${whole}\\frac{${remainder}}{${den}}`;
    }
});