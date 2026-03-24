// Interactive Canvas Particle Script
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray;

// Mouse Object handling interaction
let mouse = {
    x: null,
    y: null,
    radius: (canvas.height / 80) * (canvas.width / 80)
};

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Update size on window resize
window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    mouse.radius = ((canvas.height / 80) * (canvas.height / 80));
    init();
});

// Remove mouse pos when leaving window
window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Particle Definition
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        // bounce off screen edges
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Particle repulsion from mouse
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // Interaction Logic
        if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                this.x += 10;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 10;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 10;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 10;
            }
        }
        
        // Move particle normally
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

// Create particles based on screen size
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 2) - 1.5;
        let directionY = (Math.random() * 2) - 1.5;
        let color = '#888888';

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Particle connections
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 20000);
                // Creating a beautiful gradient stroke
                let gradient = ctx.createLinearGradient(particlesArray[a].x, particlesArray[a].y, particlesArray[b].x, particlesArray[b].y);
                gradient.addColorStop(0, `rgba(108, 92, 231, ${opacityValue*0.3})`); // primary color
                gradient.addColorStop(1, `rgba(0, 206, 201, ${opacityValue*0.3})`);   // secondary color
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

// Initialize and begin animation
init();
animate();

// --- UI CARD GLOW EFFECTS ---
const cards = document.querySelectorAll('.action-card');

cards.forEach(card => {
    const glow = card.querySelector('.card-glow');
    
    // Track mouse position within the card for the flashlight/glow effect
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.
        
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
        glow.style.opacity = '1';
    });
    
    // Hide glow when mouse leaves
    card.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    // Add click animation interactions
    card.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = ''; // Return to hover state essentially via CSS
        }, 150);
        
        // Identify which action was triggered
        if (this.id === 'mergeBtn') {
            setTimeout(() => {
                document.getElementById('home-view').style.display = 'none';
                document.getElementById('merge-view').style.display = 'flex';
                initMergeWorkspace();
            }, 200);
        } else if (this.id === 'splitBtn') {
            setTimeout(() => {
                document.getElementById('home-view').style.display = 'none';
                document.getElementById('split-view').style.display = 'flex';
                initSplitWorkspace();
            }, 200);
        } else if (this.id === 'converterBtn') {
            setTimeout(() => {
                document.getElementById('home-view').style.display = 'none';
                document.getElementById('converter-view').style.display = 'flex';
                if (typeof initConverterWorkspace === 'function') initConverterWorkspace();
            }, 200);
        }
    });
});

// --- MERGE WORKSPACE LOGIC ---
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('merge-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'flex';
});

const fileSlotsContainer = document.getElementById('file-slots');
let filesData = [];

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function initMergeWorkspace() {
    if (filesData.length === 0) {
        filesData = [
            { id: generateId(), file: null },
            { id: generateId(), file: null }
        ];
    }
    renderSlots();
}

function renderSlots() {
    fileSlotsContainer.innerHTML = '';
    
    filesData.forEach((data, index) => {
        const slot = document.createElement('div');
        slot.className = `file-slot ${data.file ? 'has-file' : ''}`;
        slot.draggable = !!data.file;
        slot.dataset.index = index;
        
        let iconHtml = '<i class="fa-solid fa-file-pdf" style="color: #ff758c; margin-right: 8px;"></i>';
        if (data.file) {
            const ext = data.file.name.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg'].includes(ext)) iconHtml = '<i class="fa-solid fa-file-image" style="color: #a29bfe; margin-right: 8px;"></i>';
            else if (['png'].includes(ext)) iconHtml = '<i class="fa-regular fa-image" style="color: #00cec9; margin-right: 8px;"></i>';
        }
        
        slot.innerHTML = `
            ${data.file ? `<div class="drag-handle"><i class="fa-solid fa-grip-vertical"></i></div>` : `<div style="width: 24px; padding: 0.5rem; margin-right: 2px;"></div>`}
            <div class="file-slot-index">${index + 1}</div>
            <div class="file-slot-content">
                ${data.file ? `
                    <div class="file-name">${iconHtml} ${data.file.name}</div>
                ` : `
                    <div class="file-input-wrapper">
                        <div class="custom-file-btn"><i class="fa-solid fa-cloud-arrow-up"></i> Add File</div>
                        <input type="file" accept=".pdf, .jpg, .jpeg, .png" class="file-input" data-index="${index}">
                        <div class="file-name" style="opacity: 0.5;">PDF, JPG, or PNG</div>
                    </div>
                `}
            </div>
            ${data.file ? `<button class="remove-btn" title="Remove File" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>` : `<div style="width: 40px;"></div>`}
        `;
        
        fileSlotsContainer.appendChild(slot);
    });
    
    attachSlotEvents();
}

function attachSlotEvents() {
    // File Inputs
    const fileInputs = document.querySelectorAll('.file-input');
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const index = parseInt(e.target.dataset.index);
                filesData[index].file = e.target.files[0];
                checkAndAddNewSlot();
                renderSlots();
            }
        });
    });
    
    // Remove Buttons
    const removeBtns = document.querySelectorAll('.remove-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            filesData[index].file = null;
            pruneEmptySlots();
            renderSlots();
        });
    });
    
    // Drag and Drop
    const slots = document.querySelectorAll('.file-slot');
    let draggedIndex = null;
    
    slots.forEach(slot => {
        slot.addEventListener('dragstart', (e) => {
            draggedIndex = parseInt(slot.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => slot.style.opacity = '0.5', 0);
        });
        
        slot.addEventListener('dragend', () => {
            slot.style.opacity = '1';
            slots.forEach(s => s.classList.remove('drag-over'));
        });
        
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });
        
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            let targetIndex = parseInt(slot.dataset.index);
            if (draggedIndex === null || draggedIndex === targetIndex) return;
            if (!filesData[draggedIndex].file) return; // Prevent dragging empty slots
            
            if (!filesData[targetIndex].file) {
                // If dropped on an empty slot, map target to the end of the populated list
                targetIndex = filesData.findIndex(d => d.file === null);
                targetIndex = targetIndex > 0 ? targetIndex - 1 : 0;
            }
            
            if (draggedIndex === targetIndex) return;
            
            // Reorder items in filesData
            const draggedItem = filesData[draggedIndex];
            filesData.splice(draggedIndex, 1);
            filesData.splice(targetIndex, 0, draggedItem);
            
            renderSlots();
        });
    });
}

function checkAndAddNewSlot() {
    const allFilled = filesData.every(data => data.file !== null);
    if (allFilled) {
        filesData.push({ id: generateId(), file: null });
    }
}

function pruneEmptySlots() {
    filesData = filesData.filter(data => data.file !== null);
    
    if (filesData.length === 0) {
        filesData = [{ id: generateId(), file: null }, { id: generateId(), file: null }];
    } else {
        // ALWAYS ensure there is exactly 1 empty slot at the end if there are files
        filesData.push({ id: generateId(), file: null });
    }
}

// Merge Now Button Logic
document.getElementById('mergeNowBtn').addEventListener('click', async function() {
    const filesToMerge = filesData.filter(d => d.file !== null);
    if (filesToMerge.length < 2) {
        alert("Please select at least 2 files to merge!");
        return;
    }
    
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Merging...';
    this.style.opacity = '0.7';
    this.style.pointerEvents = 'none';
    
    try {
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        for (const data of filesToMerge) {
            const arrayBuffer = await data.file.arrayBuffer();
            const fileName = data.file.name.toLowerCase();
            const mimeType = data.file.type;
            
            if (mimeType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
                const pdfImage = await mergedPdf.embedJpg(arrayBuffer);
                const page = mergedPdf.addPage([pdfImage.width, pdfImage.height]);
                page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
            } else if (mimeType === 'image/png' || fileName.endsWith('.png')) {
                const pdfImage = await mergedPdf.embedPng(arrayBuffer);
                const page = mergedPdf.addPage([pdfImage.width, pdfImage.height]);
                page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
            } else {
                // Process natively as a standard PDF document
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
        }
        
        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged_document.pdf';
        document.body.appendChild(a);
        a.click(); // This prompts the user's browser download/save dialog
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
    } catch (error) {
        console.error("Error merging PDFs:", error);
        alert("An error occurred while merging the PDFs. Make sure they are valid PDF files.");
    } finally {
        this.innerHTML = originalText;
        this.style.opacity = '1';
        this.style.pointerEvents = 'auto';
    }
});

// --- CONVERTER WORKSPACE LOGIC ---
document.getElementById('converterBackBtn').addEventListener('click', () => {
    document.getElementById('converter-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'flex';
});

let convertFileObj = null;

function renderConvertSlot() {
    const slotEl = document.getElementById('convert-file-slot');
    if (!slotEl) return;

    if (!convertFileObj) {
        slotEl.innerHTML = `
            <div class="file-slot-content" style="width: 100%;">
                <div class="file-input-wrapper" style="width: 100%;">
                    <div class="custom-file-btn"><i class="fa-solid fa-cloud-arrow-up"></i> Select File</div>
                    <input type="file" id="convertFileInput" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png" style="position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; left: 0; top: 0; z-index: 10;">
                    <div class="file-name" style="opacity: 0.5;">Upload Word, Excel, PPT, PDF, JPG, PNG</div>
                </div>
            </div>
        `;

        const fileInput = document.getElementById('convertFileInput');
        if(fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    convertFileObj = e.target.files[0];
                    renderConvertSlot();
                    
                    const ext = convertFileObj.name.split('.').pop().toLowerCase();
                    if(typeof updateConvertWheel === 'function') updateConvertWheel(ext);
                }
            });
        }
    } else {
        const name = convertFileObj.name;
        const ext = name.split('.').pop().toLowerCase();
        
        let iconStr = '<i class="fa-solid fa-file" style="color: #a0a0a0; font-size: 1.5rem;"></i>';
        let detectedType = 'Unknown File Type';
        
        if (['pdf'].includes(ext)) {
            iconStr = '<i class="fa-solid fa-file-pdf" style="color: #ff758c; font-size: 1.5rem;"></i>';
            detectedType = 'PDF Document';
        } else if (['doc', 'docx'].includes(ext)) {
            iconStr = '<i class="fa-solid fa-file-word" style="color: #74b9ff; font-size: 1.5rem;"></i>';
            detectedType = 'Word Document';
        } else if (['xls', 'xlsx'].includes(ext)) {
            iconStr = '<i class="fa-solid fa-file-excel" style="color: #55efc4; font-size: 1.5rem;"></i>';
            detectedType = 'Excel Spreadsheet';
        } else if (['ppt', 'pptx'].includes(ext)) {
            iconStr = '<i class="fa-solid fa-file-powerpoint" style="color: #fab1a0; font-size: 1.5rem;"></i>';
            detectedType = 'PowerPoint Presentation';
        } else if (['jpg', 'jpeg'].includes(ext)) {
            iconStr = '<i class="fa-solid fa-file-image" style="color: #a29bfe; font-size: 1.5rem;"></i>';
            detectedType = 'JPG Image';
        } else if (['png'].includes(ext)) {
            iconStr = '<i class="fa-regular fa-image" style="color: #00cec9; font-size: 1.5rem;"></i>';
            detectedType = 'PNG Image';
        }

        slotEl.innerHTML = `
            <div class="file-slot-content" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0.5rem;">
                <div style="display:flex; align-items:center; gap: 1rem;">
                    ${iconStr} 
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight: 600; color:var(--text-primary); text-align: left;">${name}</span>
                        <span style="font-size:0.9rem; color:var(--secondary-accent); text-align: left;">Detected Type: ${detectedType}</span>
                    </div>
                </div>
                <button class="remove-btn" id="removeConvertFileBtn" title="Remove File"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
        
        const removeBtn = document.getElementById('removeConvertFileBtn');
        if(removeBtn) {
            removeBtn.addEventListener('click', () => {
                convertFileObj = null;
                renderConvertSlot();
                if(typeof updateConvertWheel === 'function') updateConvertWheel(null);
            });
        }
    }
}

class Wheel3D {
    constructor(elementId) {
        this.el = document.getElementById(elementId);
        if (!this.el) return;
        
        this.angle = 0;
        const count = this.el.querySelectorAll('.wheel-item').length;
        this.itemsCount = count > 0 ? count : 6;
        this.step = 360 / this.itemsCount;
        
        this.startY = 0;
        this.startAngle = 0;
        this.isDragging = false;
        
        // Touch events
        this.el.addEventListener('touchstart', (e) => this.handleDragStart(e.touches[0].clientY), {passive: false});
        window.addEventListener('touchmove', (e) => this.handleDragMove(e.touches[0].clientY), {passive: false});
        window.addEventListener('touchend', () => this.handleDragEnd());
        
        // Mouse events
        this.el.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handleDragStart(e.clientY);
        });
        window.addEventListener('mousemove', (e) => this.handleDragMove(e.clientY));
        window.addEventListener('mouseup', () => this.handleDragEnd());
        
        // Scroll / Wheel
        this.el.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                this.rotate(-1); // Scroll down -> rotate up
            } else {
                this.rotate(1); // Scroll up -> rotate down
            }
        }, {passive: false});
    }
    
    handleDragStart(clientY) {
        this.isDragging = true;
        this.startY = clientY;
        this.startAngle = this.angle;
        this.el.style.transition = 'none'; 
    }
    
    handleDragMove(clientY) {
        if (!this.isDragging) return;
        const deltaY = clientY - this.startY;
        this.angle = this.startAngle - (deltaY * 0.5);
        this.el.style.transform = `rotateX(${this.angle}deg)`;
    }
    
    handleDragEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const snapSteps = Math.round(this.angle / this.step);
        this.angle = snapSteps * this.step;
        
        this.el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        this.el.style.transform = `rotateX(${this.angle}deg)`;
    }
    
    rotate(direction) {
        this.angle += direction * this.step;
        this.el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        this.el.style.transform = `rotateX(${this.angle}deg)`;
    }
}

let convertWheel = null;
let currentConvertFormats = ['WORD', 'EXCEL', 'PNG', 'JPG', 'PDF', 'PPT'];

function updateConvertWheel(sourceExt) {
    let formats = ['WORD', 'EXCEL', 'PNG', 'JPG', 'PDF', 'PPT']; // default
    if (sourceExt) {
        if (['jpg', 'jpeg'].includes(sourceExt)) formats = ['PNG', 'PDF', 'WORD'];
        else if (['png'].includes(sourceExt)) formats = ['JPG', 'PDF', 'WORD'];
        else if (['pdf'].includes(sourceExt)) formats = ['JPG', 'PNG', 'WORD', 'EXCEL', 'PPT'];
        else if (['doc', 'docx'].includes(sourceExt)) formats = ['JPG', 'PNG', 'PDF', 'PPT'];
        else if (['xls', 'xlsx'].includes(sourceExt)) formats = ['JPG', 'PNG', 'WORD', 'PPT', 'PDF'];
        else if (['ppt', 'pptx'].includes(sourceExt)) formats = ['JPG', 'PNG', 'WORD', 'PDF'];
    }
    
    // Duplicate formats to ensure the 3D wheel has enough items to form a circle
    // If the step is >= 90deg, the adjacent items are hidden by CSS backface-visibility
    let displayFormats = [...formats];
    while (displayFormats.length < 5) {
        displayFormats = displayFormats.concat(formats);
    }
    
    currentConvertFormats = displayFormats;
    const wheelEl = document.getElementById('convert-wheel');
    if (!wheelEl) return;
    
    wheelEl.innerHTML = '';
    
    const iconMap = {
        'WORD': '<i class="fa-solid fa-file-word" style="color: #74b9ff; margin-right: 10px;"></i> WORD',
        'EXCEL': '<i class="fa-solid fa-file-excel" style="color: #55efc4; margin-right: 10px;"></i> EXCEL',
        'PNG': '<i class="fa-regular fa-image" style="color: #00cec9; margin-right: 10px;"></i> PNG',
        'JPG': '<i class="fa-solid fa-file-image" style="color: #a29bfe; margin-right: 10px;"></i> JPG',
        'PDF': '<i class="fa-solid fa-file-pdf" style="color: #ff758c; margin-right: 10px;"></i> PDF',
        'PPT': '<i class="fa-solid fa-file-powerpoint" style="color: #fab1a0; margin-right: 10px;"></i> PPT'
    };
    
    const count = displayFormats.length;
    const step = 360 / count;
    
    displayFormats.forEach((format, i) => {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.style.transform = `rotateX(calc(${i} * -${step}deg)) translateZ(110px)`;
        item.innerHTML = iconMap[format];
        wheelEl.appendChild(item);
    });
    
    if (convertWheel) {
        convertWheel.itemsCount = count;
        convertWheel.step = step;
        convertWheel.angle = 0;
        convertWheel.startAngle = 0;
        wheelEl.style.transition = 'transform 0.4s ease'; // smooth snap
        wheelEl.style.transform = `rotateX(0deg)`;
    }
}

function getSelectedTargetFormat() {
    if (!convertWheel) return currentConvertFormats[0];
    const angle = convertWheel.angle;
    const count = currentConvertFormats.length;
    const step = convertWheel.step;
    const index = (Math.round(angle / step) % count + count) % count;
    return currentConvertFormats[index];
}

function initConverterWorkspace() {
    renderConvertSlot();
    if (!convertWheel && document.getElementById('convert-wheel')) {
        setTimeout(() => {
            convertWheel = new Wheel3D('convert-wheel');
        }, 100);
    }
    
    const convertBtn = document.getElementById('convertNowBtn');
    if (convertBtn) {
        // Re-attach safe event listener
        const newBtn = convertBtn.cloneNode(true);
        convertBtn.parentNode.replaceChild(newBtn, convertBtn);
        
        newBtn.addEventListener('click', async function() {
            if (!convertFileObj) {
                alert("Please select a file to convert first.");
                return;
            }
            
            const targetFormat = getSelectedTargetFormat();
            const originalName = convertFileObj.name;
            const sourceExt = originalName.split('.').pop().toLowerCase();
            
            let targetExt = targetFormat.toLowerCase();
            let outputFilenameExt = targetExt;
            if (targetExt === 'word') outputFilenameExt = 'docx';
            if (targetExt === 'excel') outputFilenameExt = 'xlsx';
            if (targetExt === 'ppt') outputFilenameExt = 'pptx';
            
            if (sourceExt === outputFilenameExt || (sourceExt === 'jpg' && outputFilenameExt === 'jpeg') || (sourceExt === 'jpeg' && outputFilenameExt === 'jpg')) {
                alert("The source and target formats are the same!");
                return;
            }
            
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';
            this.style.opacity = '0.7';
            this.style.pointerEvents = 'none';
            
            try {
                let outBlob = convertFileObj; 
                let newName = originalName.substring(0, originalName.lastIndexOf('.')) + '.' + outputFilenameExt;
                
                if (['png', 'jpg', 'jpeg'].includes(sourceExt) && ['png', 'jpg'].includes(outputFilenameExt)) {
                    outBlob = await convertImageToImage(convertFileObj, outputFilenameExt);
                } else if (['png', 'jpg', 'jpeg'].includes(sourceExt) && outputFilenameExt === 'pdf') {
                    outBlob = await convertImageToPdf(convertFileObj);
                } else {
                    // Send to our newly built local node.js backend server!
                    const formData = new FormData();
                    formData.append('file', convertFileObj);
                    formData.append('targetFormat', outputFilenameExt);
                    
                    const response = await fetch('http://localhost:3000/api/convert', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        const errorMsg = await response.text();
                        throw new Error(`Server returned ${response.status}: ${errorMsg}`);
                    }
                    
                    // Receive the dynamically converted file binary!
                    outBlob = await response.blob();
                    newName = originalName.substring(0, originalName.lastIndexOf('.')) + '.' + outputFilenameExt;
                }
                
                if(typeof triggerDownload === 'function') {
                    triggerDownload(outBlob, newName);
                }
            } catch (err) {
                console.error("Conversion error: ", err);
                alert("An error occurred during conversion.");
            } finally {
                this.innerHTML = originalText;
                this.style.opacity = '1';
                this.style.pointerEvents = 'auto';
            }
        });
    }
}

function convertImageToImage(file, targetExt) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Fill background with white for jpg to avoid transp. artifacts
            if (targetExt === 'jpg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0);
            
            const mimeType = targetExt === 'jpg' ? 'image/jpeg' : 'image/png';
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                resolve(blob);
            }, mimeType, 0.92);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image"));
        };
        
        img.src = url;
    });
}

async function convertImageToPdf(file) {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    
    let pdfImage;
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('jpg') || file.name.toLowerCase().endsWith('jpeg')) {
        pdfImage = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('png')) {
        pdfImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
        throw new Error("Unsupported image format for PDF");
    }
    
    const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
    page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: pdfImage.width,
        height: pdfImage.height,
    });
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

// --- SPLIT WORKSPACE LOGIC ---
document.getElementById('splitBackBtn').addEventListener('click', () => {
    document.getElementById('split-view').style.display = 'none';
    document.getElementById('home-view').style.display = 'flex';
});

let splitFileData = { file: null, totalPages: 0 };
let rangesData = [{ from: '', to: '' }];
const splitFileSlotObj = document.getElementById('split-file-slot');
const rangesContainer = document.getElementById('ranges-container');

function initSplitWorkspace() {
    renderSplitSlot();
    renderRanges();
}

function renderSplitSlot() {
    splitFileSlotObj.innerHTML = `
        <div class="file-slot-content" style="width: 100%;">
            ${splitFileData.file ? `
                <div class="file-name" style="flex-grow:1;"><i class="fa-solid fa-file-pdf" style="color: #ff758c; margin-right: 8px;"></i> ${splitFileData.file.name} (Pages: ${splitFileData.totalPages})</div>
                <button class="remove-btn" id="removeSplitFileBtn" title="Remove File"><i class="fa-solid fa-xmark"></i></button>
            ` : `
                <div class="file-input-wrapper" style="width: 100%;">
                    <div class="custom-file-btn"><i class="fa-solid fa-cloud-arrow-up"></i> Select PDF to Split</div>
                    <input type="file" accept=".pdf" id="splitFileInput" style="position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; left: 0; top: 0; z-index: 10;">
                    <div class="file-name" style="opacity: 0.5;">No file selected</div>
                </div>
            `}
        </div>
    `;

    if (!splitFileData.file) {
        document.getElementById('splitFileInput').addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                splitFileData.file = e.target.files[0];
                
                try {
                    const btn = document.querySelector('#split-file-slot .custom-file-btn');
                    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reading PDF...';
                    
                    const arrayBuffer = await splitFileData.file.arrayBuffer();
                    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                    splitFileData.totalPages = pdf.getPageCount();
                    
                    // Default range to 1 -> totalPages
                    rangesData = [{ from: '1', to: splitFileData.totalPages.toString() }];
                } catch (err) {
                    console.error("Error fetching PDF pages length", err);
                    splitFileData.totalPages = 0;
                    rangesData = [{ from: '', to: '' }];
                }
                
                renderSplitSlot();
                renderRanges();
            }
        });
    } else {
        document.getElementById('removeSplitFileBtn').addEventListener('click', () => {
            splitFileData.file = null;
            splitFileData.totalPages = 0;
            rangesData = [{ from: '', to: '' }];
            renderSplitSlot();
            renderRanges();
        });
    }
}

function renderRanges() {
    rangesContainer.innerHTML = '';
    
    rangesData.forEach((range, index) => {
        const row = document.createElement('div');
        row.className = 'range-row';
        row.innerHTML = `
            <span class="range-label">Range ${index + 1}:</span>
            <span class="range-label" style="margin-left:auto;">From</span>
            <input type="number" class="range-input range-from" min="1" max="${splitFileData.totalPages || ''}" data-index="${index}" value="${range.from}" placeholder="1">
            <span class="range-label">To</span>
            <input type="number" class="range-input range-to" min="1" max="${splitFileData.totalPages || ''}" data-index="${index}" value="${range.to}" placeholder="${splitFileData.totalPages || '5'}">
            <button class="remove-btn remove-range-btn" data-index="${index}" style="width: 35px; height: 35px; min-width: 35px; margin-left: 0.5rem;"><i class="fa-solid fa-xmark"></i></button>
        `;
        rangesContainer.appendChild(row);
    });

    // Attach Input Event Listeners
    document.querySelectorAll('.remove-range-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            rangesData.splice(index, 1);
            if (rangesData.length === 0) {
                rangesData.push({ from: '', to: '' });
            }
            renderRanges();
        });
    });

    document.querySelectorAll('.range-from, .range-to').forEach(input => {
        input.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (splitFileData.totalPages && val > splitFileData.totalPages) {
                e.target.value = splitFileData.totalPages;
                val = splitFileData.totalPages;
            }
            
            const index = parseInt(e.target.dataset.index);
            const isFrom = e.target.classList.contains('range-from');
            
            if (isFrom) {
                rangesData[index].from = isNaN(val) ? '' : val.toString();
            } else {
                rangesData[index].to = isNaN(val) ? '' : val.toString();
            }
            
            checkAndAddNewRange();
        });

        input.addEventListener('wheel', (e) => {
            e.preventDefault();
            let val = parseInt(e.target.value) || 0;
            if (e.deltaY < 0) {
                val += 1;
            } else if (e.deltaY > 0) {
                val = Math.max(1, val - 1);
            }
            
            if (splitFileData.totalPages && val > splitFileData.totalPages) {
                val = splitFileData.totalPages;
            }
            
            e.target.value = val;
            
            const index = parseInt(e.target.dataset.index);
            const isFrom = e.target.classList.contains('range-from');
            if (isFrom) {
                rangesData[index].from = val.toString();
            } else {
                rangesData[index].to = val.toString();
            }
            checkAndAddNewRange();
        });
    });
}

function checkAndAddNewRange() {
    const allFilled = rangesData.every(r => r.from !== '' && r.to !== '');
    if (allFilled) {
        const index = rangesData.length;
        rangesData.push({ from: '', to: '' });
        
        // Append instead of full re-render to retain focus on the active input
        const row = document.createElement('div');
        row.className = 'range-row';
        row.innerHTML = `
            <span class="range-label">Range ${index + 1}:</span>
            <span class="range-label" style="margin-left:auto;">From</span>
            <input type="number" class="range-input range-from" min="1" max="${splitFileData.totalPages || ''}" data-index="${index}" value="" placeholder="1">
            <span class="range-label">To</span>
            <input type="number" class="range-input range-to" min="1" max="${splitFileData.totalPages || ''}" data-index="${index}" value="" placeholder="${splitFileData.totalPages || '5'}">
            <button class="remove-btn remove-range-btn" data-index="${index}" style="width: 35px; height: 35px; min-width: 35px; margin-left: 0.5rem;"><i class="fa-solid fa-xmark"></i></button>
        `;
        rangesContainer.appendChild(row);
        
        row.querySelector('.remove-range-btn').addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index);
            rangesData.splice(idx, 1);
            if (rangesData.length === 0) {
                rangesData.push({ from: '', to: '' });
            }
            renderRanges();
        });

        // Attach event listeners to new inputs
        row.querySelectorAll('.range-from, .range-to').forEach(input => {
            input.addEventListener('input', (e) => {
                let val = parseInt(e.target.value);
                if (splitFileData.totalPages && val > splitFileData.totalPages) {
                    e.target.value = splitFileData.totalPages;
                    val = splitFileData.totalPages;
                }
                
                const idx = parseInt(e.target.dataset.index);
                const isFrom = e.target.classList.contains('range-from');
                if (isFrom) {
                    rangesData[idx].from = isNaN(val) ? '' : val.toString();
                } else {
                    rangesData[idx].to = isNaN(val) ? '' : val.toString();
                }
                checkAndAddNewRange();
            });

            input.addEventListener('wheel', (e) => {
                e.preventDefault();
                let val = parseInt(e.target.value) || 0;
                if (e.deltaY < 0) {
                    val += 1;
                } else if (e.deltaY > 0) {
                    val = Math.max(1, val - 1);
                }
                
                if (splitFileData.totalPages && val > splitFileData.totalPages) {
                    val = splitFileData.totalPages;
                }
                
                e.target.value = val;
                
                const idx = parseInt(e.target.dataset.index);
                const isFrom = e.target.classList.contains('range-from');
                if (isFrom) {
                    rangesData[idx].from = val.toString();
                } else {
                    rangesData[idx].to = val.toString();
                }
                checkAndAddNewRange();
            });
        });
    }
}

// Split Now Button Logic
document.getElementById('splitNowBtn').addEventListener('click', async function() {
    if (!splitFileData.file) {
        alert("Please select a PDF file to split!");
        return;
    }
    
    const validRanges = rangesData.filter(r => r.from !== '' && r.to !== '');
    if (validRanges.length === 0) {
        alert("Please specify at least one valid range!");
        return;
    }
    
    const mergeInOnePdf = document.getElementById('mergeInOnePdfBtn').checked;
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    this.style.opacity = '0.7';
    this.style.pointerEvents = 'none';
    
    try {
        const { PDFDocument } = PDFLib;
        const arrayBuffer = await splitFileData.file.arrayBuffer();
        const originalPdf = await PDFDocument.load(arrayBuffer);
        const totalPages = originalPdf.getPageCount();
        
        // Validate all ranges before processing
        for (const range of validRanges) {
            const from = parseInt(range.from);
            const to = parseInt(range.to);
            if (isNaN(from) || isNaN(to) || from < 1 || to > totalPages || from > to) {
                alert(`Invalid range detected: ${range.from} to ${range.to}. Pages must be between 1 and ${totalPages}, and 'From' must be <= 'To'.`);
                return; // The 'finally' block will still execute to reset the UI
            }
        }
        
        if (mergeInOnePdf) {
            // MERGE MODE: Extract all requested ranges into ONE output file
            const newPdf = await PDFDocument.create();
            for (const range of validRanges) {
                const fromIdx = parseInt(range.from) - 1;
                const toIdx = parseInt(range.to) - 1;
                
                const indices = [];
                for (let i = fromIdx; i <= toIdx; i++) {
                    indices.push(i);
                }
                
                const copiedPages = await newPdf.copyPages(originalPdf, indices);
                copiedPages.forEach((page) => newPdf.addPage(page));
            }
            
            const pdfBytes = await newPdf.save();
            triggerDownload(pdfBytes, `split_merged_${splitFileData.file.name}`);
        } else {
            // SPLIT MODE: Extract discrete files for each range
            for (let i = 0; i < validRanges.length; i++) {
                const range = validRanges[i];
                const fromIdx = parseInt(range.from) - 1;
                const toIdx = parseInt(range.to) - 1;
                
                const newPdf = await PDFDocument.create();
                const indices = [];
                for (let j = fromIdx; j <= toIdx; j++) {
                    indices.push(j);
                }
                
                const copiedPages = await newPdf.copyPages(originalPdf, indices);
                copiedPages.forEach(page => newPdf.addPage(page));
                
                const pdfBytes = await newPdf.save();
                
                // Tiny timeout space ensures browsers don't completely block subsequent programmatic downloads
                setTimeout(() => {
                    triggerDownload(pdfBytes, `split_pages_${range.from}_to_${range.to}.pdf`);
                }, i * 600);
            }
        }
        
    } catch (error) {
        console.error("Error splitting PDF:", error);
        alert("An error occurred while splitting the PDF. Ensure it's not encrypted or corrupted.");
    } finally {
        this.innerHTML = originalText;
        this.style.opacity = '1';
        this.style.pointerEvents = 'auto';
    }
});

function triggerDownload(data, filename) {
    let blob;
    if (data instanceof Blob) {
        blob = data;
    } else {
        blob = new Blob([data], { type: filename.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
