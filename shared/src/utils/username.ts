export const getEmailUsername = (email: string) => {
    return email.split('@')[0] ?? '';
}

export const getRandomUsername = ({ numberPart = true }: { numberPart?: boolean } = {}) => {
    const namePart1 = [
        'Mystic', 'Cosmic', 'Quantum', 'Digital', 'Virtual', 'Neon', 'Phantom',
        'Shadow', 'Silver', 'Golden', 'Crimson', 'Azure', 'Emerald', 'Arctic',
        'Solar', 'Lunar', 'Galactic', 'Atomic', 'Nano', 'Hyper', 'Mega',
        'Ultra', 'Alpha', 'Beta', 'Omega', 'Zen', 'Zenith', 'Nova', 'Void',
        'Frost', 'Flame', 'Thunder', 'Storm', 'Iron', 'Steel', 'Crystal',
        'Electric', 'Magic', 'Wild', 'Silent', 'Swift', 'Brave', 'Clever',
        'Happy', 'Calm', 'Wise', 'Fierce', 'Gentle', 'Ancient', 'Modern',
        'Future', 'Retro', 'Epic', 'Legendary', 'Mighty', 'Tiny', 'Giant',
        'Quick', 'Lucky', 'Secret', 'Hidden', 'Lost', 'Found', 'First',
        'Last', 'Only', 'Lonely', 'Social', 'Random', 'Strange', 'Weird'
    ];

    const namePart2 = [
        'Wolf', 'Fox', 'Dragon', 'Phoenix', 'Lion', 'Tiger', 'Eagle', 'Hawk',
        'Owl', 'Raven', 'Bear', 'Panda', 'Kitten', 'Puppy', 'Unicorn',
        'Griffin', 'Wizard', 'Knight', 'Ninja', 'Samurai', 'Viking', 'Pirate',
        'Alien', 'Robot', 'Cyborg', 'Android', 'Ghost', 'Specter', 'Spirit',
        'Warrior', 'Hunter', 'Ranger', 'Scout', 'Explorer', 'Traveler',
        'Wanderer', 'Nomad', 'Pioneer', 'Captain', 'Commander', 'Agent',
        'Guru', 'Master', 'Student', 'Scholar', 'Scientist', 'Engineer',
        'Artist', 'Writer', 'Poet', 'Musician', 'Dancer', 'Player', 'Gamer',
        'Coder', 'Hacker', 'Builder', 'Creator', 'Maker', 'Thinker',
        'Dreamer', 'Watcher', 'Listener', 'Speaker', 'Reader', 'Walker',
        'Runner', 'Jumper', 'Flyer', 'Swimmer', 'Surfer', 'Skier', 'Rider'
    ];

    const randomPart1 = namePart1[Math.floor(Math.random() * namePart1.length)];
    const randomPart2 = namePart2[Math.floor(Math.random() * namePart2.length)];
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Combine into username
    return numberPart ? `${randomPart1}${randomPart2}${randomNumber}` : `${randomPart1}${randomPart2}`;
};