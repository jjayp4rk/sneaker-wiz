import React, { Component } from "react";
import "./App.css";
import Camera, { IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import './Camera.css'
import "./Emoji";
import Loader from "react-loader-spinner";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shoeclass: "",
      confidence: "",
      loading: false,
      cameraOn: true,
      image: false,
      key: "",
      upload: false,
      dataUri: "",
      prediction: false
    };
  }

  getBase64(file, cb) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
      cb(reader.result);
    };
    reader.onerror = function(error) {
      console.log("Error: ", error);
    };
  }

  showCamera = e => {
    this.setState({
      cameraOn: true,
      image: false,
      loading: false,
      shoeclass: "",
      confidence: "",
      dataUri: "",
      key: ""
    });
  };

  onTakePhoto(dataUri) {
    const sneaker = dataUri.split(",")[1];
    fetch(
      "https://o1embtlbrb.execute-api.us-west-2.amazonaws.com/Dev/upload-sneaker",
      {
        method: "POST",
        body: JSON.stringify({ sneaker: sneaker })
      }
    )
      .then(response => response.json())
      .then(data =>
        this.setState({
          key: data.key,
          cameraOn: false,
          loading: true,
          dataUri: dataUri
        })
      )
      .catch(err => console.log(err));
  }

  async predictShoe(url, options, n) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let shoeclass = data.class.split("'")[1].replace(/_/g, " ");
      let confidence = String(data.confidence * 100).substring(0, 5) + "%";
      this.setState({
        image: true,
        loading: false,
        shoeclass: shoeclass,
        confidence: confidence,
        upload: false,
        prediction: true
      });
    } catch (err) {
      if (n === 1) throw err;
      return await this.predictShoe(url, options, (n = 1));
    }
  }

  handleUpload = event => {
    if (this.uploadInput.files[0]) {
      let file = this.uploadInput.files[0];
      this.getBase64(file, result => {
        fetch(
          "https://o1embtlbrb.execute-api.us-west-2.amazonaws.com/Dev/upload-sneaker",
          {
            method: "POST",
            body: JSON.stringify({ sneaker: result.split(",")[1] })
          }
        )
          .then(response => response.json())
          .then(data =>
            this.setState({
              key: data.key,
              cameraOn: false,
              image: false,
              dataUri: result,
              loading: true,
              message: "UPLOAD AN IMAGE"
            })
          )
          .catch(err => console.log(err));
      });
    } else {
      return null;
    }
  };

  handleChange = e => {
    if (this.uploadInput.files[0]) {
      let file = this.uploadInput.files[0];
      this.getBase64(file, result => {
        this.setState({
          dataUri: result,
          cameraOn: false,
          image: true,
          prediction: false
        });
      });
    }
  };

  render() {
    return (
      <div className="App">
        <center>
          <div className="wizard">
            <h1>SNEAKER WIZ</h1>
            {this.state.loading
              ? setTimeout(() => {
                  this.predictShoe(
                    "https://z1wj4hjige.execute-api.us-west-2.amazonaws.com/Prod/invocations",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        url:
                          "https://d3volmxa3y6u91.cloudfront.net/cropped_images/" +
                          this.state.key
                      })
                    }
                  );
                }, 2500)
              : null}
            {this.state.loading ? (
              <Loader type="Puff" color="#FFfFFF" height="200" width="200" />
            ) : null}
            {this.state.image ? (
              <div className="prediction">
                <img
                  className="shoeImg"
                  src={this.state.dataUri}
                  alt="user uploaded shoe"
                />
                {this.state.prediction ? (
                  <div>
                    {parseFloat(this.state.confidence) > 85 ? (
                      <div className="prediction">
                        <p>
                          I'm <span>{this.state.confidence}</span> these are{" "}
                          <span>{this.state.shoeclass}</span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p>We were unable to identify this shoe. Try again!</p>
                      </div>
                    )}

                    <button className="openCamera" onClick={this.showCamera}>
                      Take another photo!
                    </button>
                  </div>
                ) : null}
                {/* <p>
                  I'm <span>{this.state.confidence}</span> these are{" "}
                  <span>{this.state.shoeclass}</span>
                </p>
                <button className="openCamera" onClick={this.showCamera}>
                  Take another photo!
                </button> */}
              </div>
            ) : null}
            {this.state.cameraOn ? (
              <div className="camera">
                <Camera
                  imageType={IMAGE_TYPES.JPG}
                  idealResolution={{ width: 1080, height: 720 }}
                  onTakePhoto={dataUri => {
                    this.onTakePhoto(dataUri);
                  }}
                />
              </div>
            ) : null}
            {this.state.loading ? null : (
              <div className="uploader">
                <input
                  className="inputfile"
                  id="inputfile"
                  name="input"
                  ref={ref => {
                    this.uploadInput = ref;
                  }}
                  onChange={this.handleChange}
                  type="file"
                  accept="image/png, image/jpeg"
                />
                <label htmlFor="inputfile">
                  CHOOSE YOUR <span role="img">👟</span>
                </label>
                <button className="uploadButton" onClick={this.handleUpload}>
                  UPLOAD
                </button>
                {/* {this.state.upload ? (
                  <div>
                    <input
                      className="inputfile"
                      id="inputfile"
                      name="input"
                      onChange={this.handleChange}
                      ref={ref => {
                        console.log(ref);
                        this.uploadInput = ref;
                      }}
                      type="file"
                      accept="image/png, image/jpeg"
                    />
                    <label htmlFor="inputfile">
                      CHOOSE YOUR <span role="img">👟</span>
                    </label>
                  </div>
                ) : (
                  <button className="uploadButton" onClick={this.handleUpload}>
                    UPLOAD
                  </button>
                )} */}
              </div>
            )}
          </div>
        </center>
      </div>
    );
  }
}
export default App;
