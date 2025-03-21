const items = {
    'Doberman': 'Leah',
    'Labrador': 'Drew',
    'Shiba Inu': 'Alben',
    'Mini Greyhound': 'Jackie',
    'Blue Heeler Mix': 'Gabi',
    'Pitty Mix': 'Socorra',
    'Pit Mix': 'Paula',
    'Blue Heeler': 'Hudson',
    'French Bulldog': 'Hilary',
    'Scruffy Heeler': 'Jess B',
    'German Shepherd': 'Jess H',
    'Havanese': 'Kerri'
};

// Add color pairs for matches
const matchColors = {
    'Doberman': { bg: '#E8F5E9', border: '#2E7D32' },      // Light green/Dark green
    'Labrador': { bg: '#E1BEE7', border: '#6A1B9A' },      // Light purple/Dark purple
    'Shiba Inu': { bg: '#E3F2FD', border: '#1565C0' },     // Light blue/Dark blue
    'Mini Greyhound': { bg: '#C8E6C9', border: '#388E3C' }, // Medium green/Forest green
    'Blue Heeler Mix': { bg: '#D1C4E9', border: '#4527A0' }, // Light purple/Deep purple
    'Pitty Mix': { bg: '#BBDEFB', border: '#1976D2' },     // Light blue/Medium blue
    'Pit Mix': { bg: '#A5D6A7', border: '#1B5E20' },       // Sage green/Deep green
    'Blue Heeler': { bg: '#B39DDB', border: '#311B92' },    // Medium purple/Deep purple
    'French Bulldog': { bg: '#90CAF9', border: '#0D47A1' }, // Medium blue/Navy blue
    'Scruffy Heeler': { bg: '#81C784', border: '#2E7D32' }, // Medium green/Dark green
    'German Shepherd': { bg: '#9575CD', border: '#4527A0' }, // Medium purple/Deep purple
    'Havanese': { bg: '#64B5F6', border: '#1565C0' }       // Medium blue/Dark blue
};

let matches = 0;
let matchedPairs = new Set();
let currentPairings = new Map(); // Store the current random matches

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createRandomPairings() {
    currentPairings.clear();
    const shuffledIndices = shuffle([...Array(leftItems.length).keys()]);
    
    // Create random pairs
    leftItems.forEach((_, index) => {
        currentPairings.set(index, shuffledIndices[index]);
    });
}

function createGameBoard() {
    const topList = document.getElementById('left-items');
    const bottomList = document.getElementById('right-items');
    
    topList.innerHTML = '';
    bottomList.innerHTML = '';
    
    const dogs = Object.keys(items);
    const owners = Object.values(items);
    
    const shuffledDogs = shuffle([...dogs]);
    const shuffledOwners = shuffle([...owners]);
    
    shuffledDogs.forEach((dog, index) => {
        const div = document.createElement('div');
        div.className = 'item draggable';
        div.textContent = dog;
        div.draggable = true;
        div.dataset.dog = dog;
        div.style.backgroundImage = `url(./images/${dog.replace(/\s+/g, '')}.png)`;
        
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        topList.appendChild(div);
    });
    
    shuffledOwners.forEach((owner, index) => {
        const dropZone = document.createElement('div');
        dropZone.className = 'item droppable';
        dropZone.dataset.owner = owner;
        dropZone.style.backgroundImage = `url(./images/${owner.replace(/\s+/g, '')}.png)`;
        
        const ownerDiv = document.createElement('div');
        ownerDiv.textContent = owner;
        dropZone.appendChild(ownerDiv);
        
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        bottomList.appendChild(dropZone);
    });
}

function handleDragStart(e) {
    if (e.target.classList.contains('matched')) return;
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.dog);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    if (!e.target.classList.contains('matched')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function showWrongMessage() {
    const message = document.getElementById('wrong-message');
    const barkSound = document.getElementById('bark-sound');
    
    // Show message
    message.style.display = 'block';
    
    // Play sound
    barkSound.currentTime = 0; // Reset sound to start
    barkSound.play();
    
    // Hide message after animation
    setTimeout(() => {
        message.style.display = 'none';
    }, 1000);
}

function playSuccessSound() {
    const successSound = document.getElementById('success-sound');
    successSound.currentTime = 0;
    successSound.play();
}

function showSuccessMessage() {
    const message = document.getElementById('success-message');
    const victorySound = document.getElementById('victory-sound');
    
    message.style.display = 'block';
    victorySound.currentTime = 0;
    victorySound.play();
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.droppable');
    if (!dropZone || dropZone.classList.contains('matched')) return;

    dropZone.classList.remove('drag-over');
    const draggedDog = e.dataTransfer.getData('text/plain');
    const targetOwner = dropZone.dataset.owner;
    
    if (items[draggedDog] === targetOwner) {
        // Match found
        const draggedElement = document.querySelector(`.draggable[data-dog="${draggedDog}"]`);
        draggedElement.classList.add('matched');
        dropZone.classList.add('matched');
        
        // Apply unique colors for this match
        const colors = matchColors[draggedDog];
        draggedElement.style.backgroundColor = colors.bg;
        draggedElement.style.borderColor = colors.border;
        dropZone.style.backgroundColor = colors.bg;
        dropZone.style.borderColor = colors.border;
        
        matchedPairs.add(draggedDog);
        matches++;
        document.getElementById('score').textContent = matches;
        playSuccessSound();
        
        if (matches === Object.keys(items).length) {
            setTimeout(() => {
                showSuccessMessage();
            }, 500);
        }
    } else {
        // Wrong match
        showWrongMessage();
    }
}

function resetGame() {
    matches = 0;
    matchedPairs.clear();
    document.getElementById('score').textContent = '0';
    createGameBoard();
}

// Initialize the game
createGameBoard(); 