import React, { useState } from 'react';
import deck from './deck.js';

// Define our function for drawing a hand
function drawHand(handSize) {
  let newHand = [];

  while (newHand.length < handSize) {
    // Pick a random card.
    let nextCard = Math.floor(Math.random() * deck.length);

    // If it's still in the deck, add it to our hand.
    if (!deck[nextCard].hasBeenDrawn) {
      deck[nextCard].hasBeenDrawn = true;
      newHand.push({
        id: nextCard,
        suit: deck[nextCard].suit,
        number: deck[nextCard].number,
        hasBeenPicked: false
      });
    }
  }

  return newHand;
}

// Draw the initial hand
const startingHand = drawHand(3);

export default function App() {
  const [hand, setHand] = useState(startingHand); 
  const [score, setScore] = useState({ current: 0, best: 0 });
  const [canPlay, setCanPlay] = useState(true);
  const [shuffleCount, setShuffleCount] = useState(0);

  function handleClick(cardId) {
    if (!canPlay) {
      return;
    }

    const thisCard = hand.find((card) => card.id === cardId);

    // If the player has picked a new card:
    if (!thisCard.hasBeenPicked) {
      // Get a point
      const newScore = score.current + 1;
      setScore({
        current: newScore,
        best: newScore > score.best ? newScore : score.best
      });

      // If we finished a level, deal a new hand
      if (newScore === 3) {
        setHand(drawHand(6));
        return;
      }

      if (newScore === 9) {
        setHand(drawHand(9));
        return;
      }

      if (newScore === 18) {
        setCanPlay(false);
      }

      // Otherwise, mark the card as picked and shuffle the cards
      let updatedHand = hand.map((card) => {
        if (card.id === cardId) {
          return {
            ...card,
            hasBeenPicked: true
          }
        } else {
          return card;
        }
      });

      updatedHand = shuffle(updatedHand);
      setShuffleCount(shuffleCount + 1);

      setHand(updatedHand);
    } else {
      // End the game.
      setCanPlay(false);
    }
  }

  function resetGame() {
    // Reset the deck
    deck.forEach(card => {
      if (card.hasBeenDrawn) {
        card.hasBeenDrawn = false;
      }
    });

    // Draw a new hand
    setHand(drawHand(3));

    // Reset current score
    setScore({
      current: 0,
      best: score.best
    })

    // Make it playable
    setCanPlay(true);
  }

  function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  return (
    <div>
      <Header score={score} />
      <p className="message">
        <Message canPlay={canPlay} score={score} resetGame={resetGame} />
      </p>
      <section className="table">
        {hand.map((card) => <Card key={`${card.id}-${shuffleCount}`} card={card} handleClick={handleClick} canPlay={canPlay} />)} 
      </section>
    </div>
  );
}

function Header({ score }) {
  return (
    <header>
      <h1>Memory</h1>
      <Scoreboard score={score} />
    </header>
  );
}

function Scoreboard({ score }) {
  return (
    <section className="scoreboard">
      <p className="score__current"><strong>Current Score:</strong> {score.current}</p>
      <p className="score__best"><strong>Best Score:</strong> {score.best}</p>
    </section>
  );
}

function Card({ card, handleClick, canPlay }) {
  let icon, css;
  switch (card.suit) {
    case 'hearts':
      icon = '♥';
      css = 'card card--red';
      break;
    case 'diamonds':
      icon = '♦';
      css = 'card card--red';
      break;
    case 'spades':
      icon = '♠';
      css = 'card';
      break;
    case 'clubs':
      icon = '♣';
      css = 'card';
  }

  css = canPlay ? css : css + ' disabled';
  css = card.hasBeenPicked ? css + ' picked' : css;

  return (
    <button className={ css } onClick={() => handleClick(card.id) }>
      <p className="number">{ card.number } <span>{ icon }</span></p>
      <p className="suit">{ icon }</p>
      <p className="number-reversed">{ card.number } <span>{ icon }</span></p>
    </button>
  );
}

function Message({ canPlay, score, resetGame }) {
  const winMessages = [
    'Pick a card, and remember which card you picked.',
    'Now pick a different card.',
    'Nicely done! There\'s one more you haven\'t picked...',
    'Fantastic! I\'ll deal you a new hand. Can you do it with more cards?',
    'Good! Keep going...',
    'Level 3! Can you do it one more time with an even bigger hand?',
    'Your memory is incredible. Keep going!',
    'You beat the game!',
  ];

  if (canPlay || score.current === 18) {
    if (score.current <= 5) {
      return winMessages[score.current];
    } else if (score.current < 9) {
      return winMessages[4];
    } else if (score.current === 9) {
      return winMessages[5];
    } else if (score.current < 18) {
      return winMessages[6];
    } else {
      return (
        <>
          {winMessages[7]}
          <button onClick={resetGame}>Play again?</button>
        </>
      )
    }
  } else {
    return (
      <>
        You already picked that card!
        <button onClick={resetGame}>Play again?</button>
      </>
    )
  }
}