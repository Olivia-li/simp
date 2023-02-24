"use strict"

const e = React.createElement

class LikeButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = { liked: false }
  }

  render() {
    ;<div>
      <p>Hello there</p>
    </div>
  }
}

const domContainer = document.querySelector("#like_button_container")
const root = ReactDOM.createRoot(domContainer)
root.render(e(LikeButton))
