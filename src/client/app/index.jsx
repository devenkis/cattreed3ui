console.log('Hello World!');
import React from 'react';
import {render} from 'react-dom';
import AwesomeComponent from './AwesomeComponent.jsx';
import ReactDOM from 'react-dom';
import Part2App from './Part2App.jsx';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
          header: "Header from props... to child components",
          "content": "Content from props... to child components",
          data:
              [
                {"name":"root","displayName":"root","description":"rootshouldneverbedeleted","id":21,"parentId":0},
                {"name":"Electronics","displayName":"Electronics","description":"All Electronic goods","id":22,"parentId":21},
                {"name":"Mobiles","displayName":"Mobiles","description":"All Mobiles Electronic goods","id":23,"parentId":22},
                {"name":"Phones","displayName":"Phones","description":"Mobiles Phones","id":24,"parentId":22},
                {"name":"Accessories","displayName":"Accessories","description":"All Mobile Phone accessories","id":25,"parentId":24},
                {"name":"Chargers","displayName":"Chargers","description":"Chargers for mobiles","id":26,"parentId":25}
              ],
          arrayData: [],
          intData: 0,
          formData: 'Initial Data...',
          SimpleExampleData: 'Initial Data...',
          DataUpdateFromChildComponentData: 'Initial Data...-',
          apidata: []
    }

    this.setStateHandler = this.setStateHandler.bind(this);
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
    this.findDomNodeHandler = this.findDomNodeHandler.bind(this);
    this.setNewNumber = this.setNewNumber.bind(this);
    this.updatestate = this.updateState.bind(this);
    this.updatestateSimpleExample = this.updatestateSimpleExample.bind(this);
    this.updateStateDataUpdateFromChildComponent = this.updateStateDataUpdateFromChildComponent.bind(this);
    this.fillfunction = this.fillfunction.bind(this);
    //this.componentDidMount = this.componentDidMount.bind(this);
  };

  fillfunction() {
    alert("venky is here "+this.state.apidata);
    this.state.apidata.map((category, i) =>
          {
          const map = new Map();
          Object.keys(category).forEach(key => {
              map.set(key, category[key]);
          });

          <TableRow key = {i} data = {map} />
          });
  }
  componentDidMount() {
          fetch(`http://localhost:8090/categories/all`)
              .then(result=> {
                result.json().then(
                finaldata => {
                  this.setState({apidata: finaldata });
                });
                  });

      }

   updateStateDataUpdateFromChildComponent() {
    this.setState({DataUpdateFromChildComponentData: 'Data updated from the child component...'})
   }

   setStateHandler() {
      var item = "setState..."
      var myArray = this.state.arrayData;
      myArray.push(item)
      this.setState({arrayData: myArray})
   };

  forceUpdateHandler() {
       this.forceUpdate();
    };

  findDomNodeHandler() {
     var myDiv = document.getElementById('myDiv');
     ReactDOM.findDOMNode(myDiv).style.color = 'green';
  }

  setNewNumber() {
    this.setState({intData: this.state.intData + 1})
  }

  updateState(e) {
    this.setState({formData: e.target.value});
  }

  updatestateSimpleExample() {
     this.setState({SimpleExampleData: 'Data updated...'})
  }

  render () {
    return (
    <div>
        <Part2App />
        <div>
          <ContentUpdateStateDataUpdateFromChildComponent myDataProp = {this.state.DataUpdateFromChildComponentData}
          updateStateProp = {this.updateStateDataUpdateFromChildComponent}></ContentUpdateStateDataUpdateFromChildComponent>
        </div>
        <div>
          <button onClick = {this.updatestateSimpleExample}>CLICK</button>
          <h4>{this.state.SimpleExampleData}</h4>
        </div>
        <div>
            <button onClick = {this.setStateHandler}>SET STATE</button>
            <h4>State Array: {this.state.arrayData}</h4>
        </div>
        <div>
            <button onClick = {this.forceUpdateHandler}>FORCE UPDATE</button>
            <h4>Random number: {Math.random()}</h4>
        </div>
        <div>
            <button onClick = {this.findDomNodeHandler}>FIND DOME NODE</button>
            <div id = "myDiv">NODE</div>
        </div>
        <div>
           <button onClick = {this.setNewNumber}>INCREMENT</button>
           <ContentState myNumber = {this.state.intData}></ContentState>
        </div>
        <div>
            <ContentForm myDataProp = {this.state.formData}
               updateStateProp = {this.updateState}></ContentForm>
         </div>

        <div>
          <p> Hello React!</p> <AwesomeComponent />
          <h1>{this.props.headerProp}</h1>
          <h2>{this.props.contentProp}</h2>
        </div>
        <div>
          <Header headerProp = {this.state.header}/>
          <table>
               <tbody>
                  {this.fillfunction()}
               </tbody>
            </table>
          <Content contentProp = {this.state.content}/>
        </div>
        <div>
           <h3>Array: {this.props.propArray}</h3>
           <h3>Bool: {this.props.propBool ? "True..." : "False..."}</h3>
           <h3>Func: {this.props.propFunc(3)}</h3>
           <h3>Number: {this.props.propNumber}</h3>
           <h3>String: {this.props.propString}</h3>
           <h3>Object: {this.props.propObject.objectName1}</h3>
           <h3>Object: {this.props.propObject.objectName2}</h3>
           <h3>Object: {this.props.propObject.objectName3}</h3>
        </div>
    </div>
         );
  }
}

class Header extends React.Component {
  constructor() {
    super();
    this.state = {
        header: "Header from state..."
        }
    }
   render() {
      return (
         <div>
            <h1>{this.state.header}</h1>
            <h1>{this.props.headerProp}</h1>
         </div>
      );
   }
}

class TableRow extends React.Component {
   render() {
    alert(this.props.data.description);
      return (
         <tr>
            <td>{this.props.data.id}</td>
            <td>{this.props.data.name}</td>
            <td>{this.props.data.displayName}</td>
            <td>{this.props.data.description}</td>
            <td>{this.props.data.parentId}</td>
         </tr>
      );
   }
}

class Content extends React.Component {
  constructor() {
    super();
    this.state = {
        "content": "Content from state..."
        }
    }
   render() {
      return (
         <div>
            <h2>{this.state.content}</h2>
            <h2>{this.props.contentProp}</h2>
         </div>
      );
   }
}

App.propTypes = {
   propArray: React.PropTypes.array.isRequired,
   propBool: React.PropTypes.bool.isRequired,
   propFunc: React.PropTypes.func,
   propNumber: React.PropTypes.number,
   propString: React.PropTypes.string,
   propObject: React.PropTypes.object
}

App.defaultProps = {
   headerProp: "Header from props...default",
   contentProp:"Content from props...default",
   propArray: [1,2,3,4,5],
   propBool: true,
   propFunc: function(e){return e},
   propNumber: 1,
   propString: "String value...",

   propObject: {
      objectName1:"objectValue1",
      objectName2: "objectValue2",
      objectName3: "objectValue3"
   }
}

class ContentState extends React.Component {

   componentWillMount() {
      console.log('Component WILL MOUNT!')
   }

   componentDidMount() {
      console.log('Component DID MOUNT!')
   }

   componentWillReceiveProps(newProps) {
      console.log('Component WILL RECIEVE PROPS!')
   }

   shouldComponentUpdate(newProps, newState) {
      return true;
   }

   componentWillUpdate(nextProps, nextState) {
      console.log('Component WILL UPDATE!');
   }

   componentDidUpdate(prevProps, prevState) {
      console.log('Component DID UPDATE!')
   }

   componentWillUnmount() {
      console.log('Component WILL UNMOUNT!')
   }

   render() {
      return (
         <div>
            <h3>{this.props.myNumber}</h3>
         </div>
      );
   }
}

class ContentForm extends React.Component {

   render() {
      return (
         <div>
            <input type = "text" value = {this.props.myDataProp}
               onChange = {this.props.updateStateProp} />
            <h3>{this.props.myDataProp}</h3>
         </div>
      );
   }
}

class ContentUpdateStateDataUpdateFromChildComponent extends React.Component {

   render() {
      return (
         <div>
            <button onClick = {this.props.updateStateProp}>CLICK TO update parent component</button>
            <h3>data in child: {this.props.myDataProp}</h3>
         </div>
      );
   }
}

render(<App headerProp = "Header from props..." contentProp = "Content
   from props..."/>, document.getElementById('app'));
   /*setTimeout(() => {
      ReactDOM.unmountComponentAtNode(document.getElementById('app'));}, 10000);*/
