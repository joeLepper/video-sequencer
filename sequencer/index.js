var react = require('react')
  , ee = require('nee')()
  , Scheduler = require('beat-scheduler')
  , machine = require('./machine')
  , socket = require('socket.io-client')
  , io = socket()
  , ac = new window.AudioContext
  , d = react.DOM
  , initialBpm = 240
  , rows = (
      [ 'BD/BD0000.wav'
      , 'BD/BD0025.wav'
      , 'BD/BD0050.wav'
      , 'SD/SD1050.wav'
      , 'CH/CH.wav'
      , 'OH/OH00.wav'
      , 'CP/CP.wav'
      , 'CL/CL.wav'
      , 'HT/HT00.wav'
      , 'MT/MT00.wav'
      , 'LT/LT00.wav'
      , 'HC/HC00.wav'
      , 'MC/MC00.wav'
      , 'LC/LC00.wav'
      ]
    )
  , bars = 4
  , barLength = 4
  , beats = bars * barLength


window.addEventListener('load', function (e) {
  var sequencerContainer = document.querySelector('.sequencer')
    , clock = Scheduler(ac, { ee: ee, bpm: initialBpm})
    , sequenceProps = (
        { clock: clock
        , rows: rows
        , bars: bars
        , beats: beats
        , barLength: 4
        , initialBpm: initialBpm
        , ee: ee
        , ac: ac
        , io: io
        }
      )

  react.renderComponent(machine(sequenceProps), sequencerContainer)
})
