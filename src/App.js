import React, { Component } from "react";
import axios from "axios";
import "./App.css";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      class: "",
      confidence: "",
      loading: false,
      success: false,
      url: ""
    };
  }

  onTakePhoto(dataUri) {
    const sneaker = dataUri.split(",")[1];
    axios
      .post(
        "https://o1embtlbrb.execute-api.us-west-2.amazonaws.com/Dev/upload-sneaker",
        {
          sneaker: sneaker
        }
      )
      .then(response => console.log(response));
    this.setState({ loading: true });
    // Do stuff with the dataUri photo...
    console.log("takePhoto");
  }

  handleChange = event => {
    this.setState({ success: false, url: "" });
  };
  // Perform the upload
  handleUpload = ev => {
    let file = this.uploadInput.files[0];
    // Split the filename to get the name and type
    let fileParts = this.uploadInput.files[0].name.split(".");
    let fileName = fileParts[0];
    let fileType = fileParts[1];
    console.log("Preparing the upload");
    axios
      .post(
        "https://o1embtlbrb.execute-api.us-west-2.amazonaws.com/Dev/upload-sneaker",
        {
          fileName: fileName,
          fileType: fileType
        }
      )
      .then(response => {
        var returnData = response.data.data.returnData;
        var signedRequest = returnData.signedRequest;
        var url = returnData.url;
        this.setState({ url: url });
        console.log("Recieved a signed request " + signedRequest);

        // Put the fileType in the headers for the upload
        var options = {
          headers: {
            "Content-Type": fileType
          }
        };
        axios
          .put(signedRequest, file, options)
          .then(result => {
            console.log("Response from s3");
            this.setState({ success: true });
          })
          .catch(error => {
            alert("ERROR " + JSON.stringify(error));
          });
      })
      .catch(error => {
        alert(JSON.stringify(error));
      });
  };

  render() {
    const Success_message = () => (
      <div style={{ padding: 50 }}>
        <h3 style={{ color: "green" }}>SUCCESSFUL UPLOAD</h3>
        <a href={this.state.url}>Access the file here</a>
        <br />
      </div>
    );

    return (
      <div className="App">
        <center>
          <h1>SNEAKER WIZ</h1>
          <h2>Take a picture or upload a shoe!</h2>
          <Camera
            onTakePhoto={dataUri => {
              this.onTakePhoto(dataUri);
            }}
          />
          {this.state.success ? <Success_message /> : null}
          <input
            onChange={this.handleChange}
            ref={ref => {
              this.uploadInput = ref;
            }}
            type="file"
          />
          <br />
          <button onClick={this.handleUpload}>UPLOAD</button>
        </center>
      </div>
    );
  }
}
export default App;
