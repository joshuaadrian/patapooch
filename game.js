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
let draggedElement = null;  // Track currently dragged element
let audioContext = null;
let audioBuffers = {};

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

function initAudio() {
    if (audioContext) return;
    
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load all sound effects
    const sounds = {
        'bark': 'https://www.myinstants.com/media/sounds/dry-fart.mp3',
        'success': 'https://www.myinstants.com/media/sounds/minecraft-dog-bark.mp3',
        'victory': 'https://www.myinstants.com/media/sounds/mario-meme.mp3'
    };
    
    // Load each sound
    Object.entries(sounds).forEach(([name, url]) => {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(buffer => audioContext.decodeAudioData(buffer))
            .then(decodedBuffer => {
                audioBuffers[name] = decodedBuffer;
            });
    });
}

function playSound(soundName) {
    // Try HTML5 Audio first (for desktop)
    const audioMap = {
        'bark': 'bark-sound',
        'success': 'success-sound',
        'victory': 'victory-sound'
    };
    
    const audioElement = document.getElementById(audioMap[soundName]);
    if (audioElement) {
        audioElement.currentTime = 0;
        const playPromise = audioElement.play();
        
        if (playPromise) {
            playPromise.catch(() => {
                // If HTML5 Audio fails, try Web Audio API
                playWebAudio(soundName);
            });
        }
    } else {
        // Fallback to Web Audio API
        playWebAudio(soundName);
    }
}

function playWebAudio(soundName) {
    if (!audioContext || !audioBuffers[soundName]) return;
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[soundName];
    source.connect(audioContext.destination);
    source.start(0);
}

function createGameBoard() {
    // Initialize audio if not already done
    initAudio();
    
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
        
        // Add both drag and touch events
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
        div.addEventListener('touchstart', handleTouchStart);
        div.addEventListener('touchmove', handleTouchMove);
        div.addEventListener('touchend', handleTouchEnd);
        
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
        
        // Add both drag and touch events
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        dropZone.addEventListener('touchenter', handleTouchEnter);
        dropZone.addEventListener('touchleave', handleTouchLeave);
        
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
    message.style.display = 'block';
    
    playSound('bark');
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 1000);
}

function playSuccessSound() {
    playSound('success');
}

function showSuccessMessage() {
    const message = document.getElementById('success-message');
    message.style.display = 'block';
    
    playSound('victory');
    
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// Touch event handlers
function handleTouchStart(e) {
    if (e.target.classList.contains('matched')) return;
    
    draggedElement = e.target;
    e.target.classList.add('dragging');
    
    // Prevent scrolling while dragging
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!draggedElement) return;
    
    const touch = e.touches[0];
    const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Remove drag-over class from all elements
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    
    // Add drag-over class if we're over a valid drop zone
    if (dropZone && dropZone.classList.contains('droppable') && !dropZone.classList.contains('matched')) {
        dropZone.classList.add('drag-over');
    }
    
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!draggedElement) return;
    
    const touch = e.changedTouches[0];
    const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (dropZone && dropZone.classList.contains('droppable')) {
        // Simulate drop event
        const draggedDog = draggedElement.dataset.dog;
        const targetOwner = dropZone.dataset.owner;
        
        handleMatch(draggedElement, dropZone, draggedDog, targetOwner);
    }
    
    // Clean up
    draggedElement.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    draggedElement = null;
    
    e.preventDefault();
}

function handleTouchEnter(e) {
    if (!e.target.classList.contains('matched')) {
        e.target.classList.add('drag-over');
    }
}

function handleTouchLeave(e) {
    e.target.classList.remove('drag-over');
}

// Refactor match handling into separate function to avoid code duplication
function handleMatch(draggedElement, dropZone, draggedDog, targetOwner) {
    if (!dropZone || dropZone.classList.contains('matched')) return;
    
    dropZone.classList.remove('drag-over');
    
    if (items[draggedDog] === targetOwner) {
        // Match found
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

// Update existing handleDrop function to use handleMatch
function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.droppable');
    const draggedDog = e.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.draggable[data-dog="${draggedDog}"]`);
    const targetOwner = dropZone.dataset.owner;
    
    handleMatch(draggedElement, dropZone, draggedDog, targetOwner);
}

function resetGame() {
    matches = 0;
    matchedPairs.clear();
    document.getElementById('score').textContent = '0';
    createGameBoard();
}

// Initialize the game
createGameBoard();

// Initialize audio on first user interaction
document.addEventListener('touchstart', initAudio, { once: true });
document.addEventListener('mousedown', initAudio, { once: true }); 