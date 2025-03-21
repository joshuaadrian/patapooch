const items = {
    'Doberman': 'Leah',
    'Labrador': 'Drew',
    'Shiba Inu': 'Alben',
    'Mini Greyhound': 'Jackie',
    'Blue Heeler Mix': 'Gabi',
    'Pit Mix': 'Socorra',
    'Pit Mix': 'Paula',
    'Blue Heeler': 'Hudson',
    'French Bulldog': 'Hillary',
    'Scruffy Heeler': 'Jess B',
    'German Shepherd': 'Jess H',
    'Havanese': 'Kerri'
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
    const topList = document.getElementById('left-items');  // We'll keep the IDs but use them differently
    const bottomList = document.getElementById('right-items');
    
    topList.innerHTML = '';
    bottomList.innerHTML = '';
    
    // Get dogs and owners from the items object
    const dogs = Object.keys(items);
    const owners = Object.values(items);
    
    // Shuffle both arrays
    const shuffledDogs = shuffle([...dogs]);
    const shuffledOwners = shuffle([...owners]);
    
    shuffledDogs.forEach((dog, index) => {
        const div = document.createElement('div');
        div.className = 'item draggable';
        div.textContent = dog;
        div.draggable = true;
        div.dataset.dog = dog;
        
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        topList.appendChild(div);
    });
    
    shuffledOwners.forEach((owner, index) => {
        const dropZone = document.createElement('div');
        dropZone.className = 'item droppable';
        dropZone.dataset.owner = owner;
        
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
        matchedPairs.add(draggedDog);
        matches++;
        document.getElementById('score').textContent = matches;
        playSuccessSound();
        
        if (matches === Object.keys(items).length) {
            setTimeout(() => {
                alert('Congratulations! You\'ve matched all the dogs to their owners!');
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