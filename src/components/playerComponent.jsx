import React from 'react'

const PlayerComponent = ({ player }) => {
    if(player){
        return <div>
            <div className={`container`}>
                <div className={`col-12`}>
                    <h2 className={`text-left`}>{player.attributes.name}</h2>
                </div>
            </div>
        </div>
    } else {
        return <div></div>
    }
}

export default PlayerComponent;