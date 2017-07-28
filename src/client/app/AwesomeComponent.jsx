import React from 'react';

class AwesomeComponent extends React.Component {

  //xyz="start";




 /*UserAction() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://localhost:8090/categories/all", false);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    var response = JSON.parse(xhttp.responseText);
    this.xyz = response;
}*/

  constructor(props) {
    super(props);
    this.state = {likesCount : 0};
    this.onLike = this.onLike.bind(this);
  }

  onLike () {
    let newLikesCount = this.state.likesCount + 1;
    this.setState({likesCount: newLikesCount});
  }



  render() {
    var i = 1;
    var myStyle = {
             fontSize: 100,
             color: '#FF0000'
          }
    return (
      <div>
        Likes : <span>{this.state.likesCount}</span>
        <div><button onClick={this.onLike}>Like Me</button></div>

        <h1>{1+1}</h1>
        <p data-myattribute = "somevalue">This is the content!!! with custom attribute for the tag</p>
        <h1>{i == 1 ? 'True!' : 'False'}</h1>
        <h1 style = {myStyle}>Header</h1>
      </div>
    );
  }

}

export default AwesomeComponent;
