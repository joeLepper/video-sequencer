var react = require('react')
  , d = react.DOM

module.exports = react.createClass(
  { getInitialState: function () {
      return (
        { hover: false
        , active: false
        , activated: false
        }
      )
    }
  , componentDidMount: function () {
      var self = this
        , ee = self.props.ee

      ee.on('note-button-click', function (column, row) {
        if (self.props.row === row && self.props.column === column) {
          self.setState({ activated: !self.state.activated })
        }
      })
    }
  , render: function () {
      var self = this
        , row = self.props.row
        , column = self.props.column
        , sampleName = self.props.sampleName

      var className = 'note-button'
      if (self.props.litForNow) className += ' lit'
      if (self.state.activated) className += ' activated'

      return d.button(
        { className: className
        , onClick: function () {
            self.props.ee.emit('note-button-click', [column, row, sampleName])
          }
        }
      )
    }
  }
)
