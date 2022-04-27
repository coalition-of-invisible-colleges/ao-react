import * as React from 'react'
import api from '../client/api'
import FullStar from '../assets/images/starFilled.svg'
import HalfStar from '../assets/images/starHalf.svg'
import EmptyStar from '../assets/images/starEmpty.svg'

export default function AoFiveStars(props: {taskId: string, stars: number}) {
	const rateStars = (numberOfStars: number) => {
	  api.setCardProperty(props.taskId, 'stars', numberOfStars)
	}
	
	const renderedStars = [0, 1, 2, 3, 4, 5].map(index => {
	  const starImage = index === 0 ? EmptyStar : (props.stars >= index ? FullStar : EmptyStar)
	  return <img src={starImage} onClick={() => rateStars(index)} />
	})
	
	return (
	  <div className='fiveStars'>
	    {renderedStars}
	  </div>
	)
}