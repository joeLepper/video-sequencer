var react = require('react')
  , d = react.DOM
  , row = require('./row')
  , currentBeat = 15
  , nextBeat = 0
  , lastBeat

module.exports = react.createClass(
  { componentWillMount: function () {
      var self = this
        , ac = self.props.ac
        , ee = self.props.ee
        , clock = self.props.clock
        , scheduledSamples = {}
        , scheduled = false
        , samples = {}
        , io = self.props.io

      ee.on('next-tick', function (beat) {
        if (lastBeat !== beat.lastBeat) {
          scheduled = false
          lastBeat = beat.lastBeat
          currentBeat === 15 ? currentBeat = 0 : currentBeat++
          nextBeat === 15 ? nextBeat = 0 : nextBeat++
          self.setState({ currentBeat: currentBeat })
          ee.emit('next-beat', [])
        }

        if (!scheduled && beat.nextBeat < beat.lookahead) {
          Object.keys(scheduledSamples).forEach(function (sampleName, index) {
            if (scheduledSamples[sampleName][nextBeat]) {
              io.emit('glitch', [true, index])
              setSample(beat.nextBeat, sampleName)
            } else io.emit('glitch', [false, index])
          })
          scheduled = true
        }
      })
      ee.on('remove-row', function (sampleName) { delete scheduleNotes[sampleName] })
      ee.on('register-row', function (sampleName) {

        loadSample(sampleName)
        scheduledSamples[sampleName] = []

        function loadSample (url) {
          var request = new XMLHttpRequest()
          request.open('GET', 'TR808WAV/' + url, true)
          request.responseType = 'arraybuffer'

          request.onload = function () {
            ac.decodeAudioData(request.response, function decodeResponse (buffer) {
              samples[sampleName] = buffer
            }, onError)
          }
          request.send()
        }
        function onError (err) { throw(err) }
      })
      ee.on('note-button-click', function (column, row, sampleName) {
        scheduledSamples[sampleName][column] = !scheduledSamples[sampleName][column]
      })
      ee.on('bpm-change', function (bpm) {
        self.setState({ bpm: bpm })
        clock.changeBpm(bpm)
      })
      ee.on('swing-change', function (swing) {
        self.setState({ swing: swing })
        clock.changeSwing(swing)
      })
      io.on('init-ack', function (socketId) {
        console.log('room: ', socketId)
        self.setState({ socketId: socketId })
        clock.play()
      })
      io.emit('init')


      function setSample (time, name) {
        var source = ac.createBufferSource()
        source.buffer = samples[name]
        source.connect(ac.destination)
        source.start(time)
      }
    }
  , getInitialState: function () {
      var self = this
      return (
        { currentBeat: 0
        , bpm: self.props.initialBpm
        , swing: 0.25
        }
      )
    }
  , render: function () {
      var self = this
        , controls = self.props.rows.map(function (sampleName, index) {
            return row(
              { sampleName: sampleName
              , ee: self.props.ee
              , row: index
              , currentBeat: self.state.currentBeat
              , numberOfBeats: self.props.beats
              }
            )
          })
      controls.unshift(d.div({ className: 'group'}, (
        [ d.div({ className: 'item' }
          , [ d.label({}, 'bpm: ' + (self.state.bpm / 2))
            , d.div({}
              , d.input(
                  { type: 'range'
                  , min: 60
                  , max: 1200
                  , value: self.state.bpm
                  , step: 0.25
                  , onChange: function (e) {
                      self.props.ee.emit('bpm-change', [e.target.value])
                    }
                  }
                )
              )
            ]
          )
        , d.div({ className: 'item' }
          , [ d.label({}, 'swing: ' + self.state.swing)
            , d.div({}
              , d.input(
                  { type: 'range'
                  , min: 0
                  , max: 1
                  , value: self.state.swing
                  , step: 0.01
                  , onChange: function (e) {
                      console.log(e.target.value)
                      self.props.ee.emit('swing-change', [e.target.value])
                    }
                  }
                )
              )
            ]
          )
        ]
      )))
      return d.div({ className: 'controls' }, controls)
    }
  }
)