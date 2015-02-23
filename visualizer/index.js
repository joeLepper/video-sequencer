var react = require('react')
  , ee = require('nee')()
  , clock = require('beat-scheduler')(new window.AudioContext(), { ee: ee, bpm: 240})
  , socket = require('socket.io-client')
  , d = react.DOM

var output = react.createClass(
  { getInitialState: function () {
      return (
        { glitches: []
        , height: window.innerHeight
        , width: window.innerWidth
        }
      )
    }
  , componentDidMount: function () {
      var self = this
        , canvas = self.getDOMNode()
        , context = canvas.getContext('2d')

      window.addEventListener('resize', function () {
        self.setState(
          { height: window.innerHeight
          , width: window.innerWidth
          }
        )
      })

      self.props.ee.on('update-output', function (img) {
        var ctx = img.getContext('2d')

        self.state.glitches.forEach(function (glitch, index) {
          if (index % 2) {
            if (glitch) {
              var heightUnit = self.state.height / 14
                , idxY = Math.max((index + 1) * Math.floor(Math.random() * heightUnit), (index + 1) * Math.floor(Math.random() * (heightUnit/2)))+ 1
                , idxHeight =  Math.min((index + 1) * Math.floor(Math.random() * heightUnit), (index + 1) * Math.floor(Math.random() * (heightUnit/2))) + 1
                , strip = ctx.getImageData(0, idxY, self.state.width, idxHeight)

              for (var i = 0; i < strip.data.length; i++){
                var pixel = strip.data[i]
                if (i % index === 0) pixel = 255 - pixel
                strip.data[i] = pixel
              }

              context.putImageData(strip, 0, idxY)
            }
          }
          else {
            if (glitch) {
              var widthUnit = self.state.height / 14
                , idxX = Math.max((index + 1) * Math.floor(Math.random() * widthUnit), (index + 1) * Math.floor(Math.random() * (widthUnit/2))) + 1
                , idxWidth = Math.min((index + 1) * Math.floor(Math.random() * widthUnit), (index + 1) * Math.floor(Math.random() * (widthUnit/2))) + 1
                , strip = ctx.getImageData(idxX, 0, idxWidth, self.state.height)

              for (var i = 0; i < strip.data.length; i++){
                var pixel = strip.data[i]
                if (i % index === 0) pixel = 255 - pixel
                strip.data[i] = pixel
              }

              context.putImageData(strip, idxX, 0)
            }
          }
        })
      })
      self.props.io.on('g', function (args) {
        var state = args[0]
          , index = args[1]
          , glitches = self.state.glitches

        glitches[index] = state
        self.setState({ glitches: glitches })
      })
    }
  , render: function () {
      var self = this
      return d.canvas(
        { height: self.state.height
        , width: self.state.width
        }
      )
    }
  }
)

var buff = react.createClass(
  { componentDidMount: function () {
      var self = this
        , canvas = self.getDOMNode().children[0]
        , context = canvas.getContext('2d')
        , container = self.getDOMNode()

      self.props.ee.on('update-buffer', function (video) {
        var img = document.createElement('img')
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        self.props.ee.emit('update-output', [canvas])
      })
    }
  , render: function () {
    var self = this
      return d.div({ className: 'canvas wrapper'}
      , [ d.canvas({ className: 'hidden', height: 333, width: 445 })
        , output({ ee: this.props.ee, io: this.props.io })
        ]
      )
    }
  }
)

var viz = react.createClass(
  { getInitialState: function () { return { joined: false } }
  , componentWillMount: function () {
      this.setState({ src: window.URL.createObjectURL(this.props.stream) })
    }
  , componentDidMount: function () {
      var self = this
        , clock = self.props.clock

      self.props.ee.on('next-tick', function () {
        self.props.ee.emit('update-buffer', [self.getDOMNode().children[2]])
      })

      clock.play()
    }
  , render: function () {
    var self = this
      return d.div({ className: 'wrapper'}
      , [ d.input(
            { type: 'text'
            , className: self.state.joined ? 'hidden' : ''
            , onChange: function (e) {
                self.setState({ room: e.currentTarget.value })
              }
            }
          )
        , d.button(
            { className: self.state.joined ? 'hidden' : ''
            , onClick: function () {
                self.props.io.emit('join-room', self.state.room)
                self.setState({ joined: true })
              }
            }
          , 'join'
          )
        , d.video(
            { autoPlay: true
            , src: this.state.src
            , className: 'hidden'
            ,  height: 333.75, width: 445
            }
          )
        , buff({ ee: this.props.ee, io: this.props.io })
        ]
      )
    }
  }
)

window.addEventListener('load', function (e) {
  var visualizationContainer = document.querySelector('.visualization')

  navigator.webkitGetUserMedia(
    { video: true }
  , function (stream) {
      var vizProps = (
        { stream: stream
        , ee: ee
        , io: socket()
        , clock: clock
        }
      )

      react.renderComponent(viz(vizProps), visualizationContainer)
    }
  , function (err) { console.error(err)
    }
  )
})
