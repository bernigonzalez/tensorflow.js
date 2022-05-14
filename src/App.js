import './App.css';
import { useState, useEffect, useRef } from 'react';
//import * as mobilenet from "@tensorflow-models/mobilenet";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import "@tensorflow/tfjs-backend-cpu";
import { isPromise } from '@tensorflow/tfjs-core/dist/util_base';
//import "@tensorflow/tfjs-backend-webgl";


function App() {
  const [isModelLoading, setIsModelLoading] = useState(false)
    const [model, setModel] = useState(null)
    const [imageData, setImageData] = useState(null)
    const imageRef = useRef()
    const [results, setResults] = useState(null)
    const textInputRef = useRef()
    const fileInputRef = useRef()

    //the function that load the model
    // const loadModel = async () => {
    //   setIsModelLoading(true)
    //   try {
    //     const model = await cocoSsd.load({});
    //     //const model = await mobilenet.load() //load the model from the library
    //     console.log("el modelo ya esta cargado ", model)

    //     setModel(model)
    //     setIsModelLoading(false)
    //   }catch(err){
    //     console.log(err)
    //     setIsModelLoading(false)
    //   }
    // }

    const normalizePredictions = (results, imgSize) => {
      if(!results || !imgSize || !imageRef) return results || []
      
      return results.map((prediction) => {
        const {bbox} = prediction;
        const oldX = bbox[0]
        const oldY = bbox[1]
        const oldWidth = bbox[2]
        const oldHeight = bbox[3] 

        const imgWidth = imageRef.current.width
        const imgHeight = imageRef.current.height

        const x = (oldX * imgWidth / imgSize.width)
        const y = (oldY * imgHeight / imgSize.height)
        const width = (oldWidth * imgWidth / imgSize.width) 
        const height = (oldHeight * imgHeight / imgSize.height)

        return {...prediction, bbox: [x, y, width, height]}
      })
    }

    const uploadImage = (e) => {
      if(fileInputRef.current) fileInputRef.current.click()
    }

    const onSelectImage = async(e) => {
      const file = e.target.files[0]
      const imgData = await readImage(file)
      setImageData(imgData)

      const imageElement = document.createElement("img");
      imageElement.src = imgData

      imageElement.onload = async() => {
        const imgSize = { width: imageElement.width, height: imageElement.height}
        await detectObjects(imageElement, imgSize)  
      }
    }

    const readImage = (file) => {
      return new Promise((rs, rj) => {
          const fileReader = new FileReader();
          fileReader.onload = () => rs(fileReader.result);
          fileReader.onerror = () => rj(fileReader.error)
          fileReader.readAsDataURL(file);
      })
    }

    
    

    const detectObjects =  async(imageElement, imgSize) => {
      alert("Esto puede demorar unos segundos...")

      //const model = await mobilenet.load()
      const model = await cocoSsd.load({});
      const predictions = await model.detect(imageElement, 6);
      //const predictions = await model.classify(imageRef.current) //mobileNet ==>> img classifier
      
       
      setResults(normalizePredictions(predictions, imgSize))
      console.log("resultados del modelo", predictions)
    }

    

    
    

    // useEffect(() => {
    //   loadModel()
    // }, [])

    // {results && results?.map(el => (
    //   <div style={{
    //     position: "absolute",
    //     left: el.bbox[0] + "px",
    //     top: el.bbox[1] + "px",
    //     width: el.bbox[2] + "px",
    //     height: el.bbox[3] + "px",

    //     border: "4px solid #1ac71a",
    //     backgroundcolor: "transparent",
    //     zindex: "20",
    //   }}>

    //!!!!!!!!!!!!!!!!!!!!!  CSS para esconder el input para subir una imagen desde la pc !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //styles={{width:"0px", height:"0px", visibility:"hidden", opacity:"0"}}

    // if(isModelLoading) {
    //   <h2>Model is Loading...</h2>
    // }
  return (
    <div className="ObjectDetectorContainer">
      <h1 className='header'>TensorFlow.js</h1>
      <button onClick={uploadImage}className='SelectButton'>Subi tu imagen</button>
      <div className='DetectorContainer'>
        {imageData && <img className='TargetImg' src={imageData} alt="product" ref={imageRef}/>}
        
        {results && results?.map(el => (
          

                  <div style={{
                    position: "absolute",
                    left: el.bbox[0] + "px",
                    top: el.bbox[1] + "px",
                    width: el.bbox[2] + "px",
                    height: el.bbox[3] + "px",

                    border: "4px solid #1ac71a",
                    backgroundcolor: "transparent",
                    zindex: "20",
                  }}>
                                        <p className='pbox'>
                                          {el.class +"   " + el.score}
                                        </p>
                  </div>
                
          ))}
      </div>    
      <input type="file" className='HiddenFileInput' ref={fileInputRef} onChange={onSelectImage}/>
    </div>
  );
}

export default App;
