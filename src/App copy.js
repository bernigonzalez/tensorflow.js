import './App.css';
import { useState, useEffect, useRef } from 'react';
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

import "@tensorflow/tfjs-backend-cpu";
import { isPromise } from '@tensorflow/tfjs-core/dist/util_base';
//import "@tensorflow/tfjs-backend-webgl";


function App() {
  const [isModelLoading, setIsModelLoading] = useState(false)
    const [model, setModel] = useState(null)
    const [imageURL, setImageURl] = useState(null)
    const imageRef = useRef()
    const [results, setResults] = useState(null)
    const textInputRef = useRef()
    const fileInputRef = useRef()

    //the function that load the model
    const loadModel = async () => {
      setIsModelLoading(true)
      try {
        const model = await cocoSsd.load({});
        //const model = await mobilenet.load() //load the model from the library
        console.log("el modelo ya esta cargado ", model)

        setModel(model)
        setIsModelLoading(false)
      }catch(err){
        console.log(err)
        setIsModelLoading(false)
      }
    }

    const uploadImage = (e) => {
      
      const {files} = e.target
      if(files?.length > 0) {
        const url = URL.createObjectURL(files[0])
        setImageURl(url)

      }else {
        setImageURl(null)
      }
    }

    const detect =  async(e) => {
      e.preventDefault()
      textInputRef.current.value = ''
      alert("Esto puede demorar unos segundos...")
      //const predictions = await model.classify(imageRef.current) //mobileNet
      const predictions = await model.detect(imageRef.current, 4);
      setResults(predictions)
      
      console.log("resultados del modelo", predictions)
    }

    const handleURLChange = (e) => {
      setImageURl(e.target.value)
      setResults([])
    }

    const triggerUploadImg = () => {
      fileInputRef.current.click()
    }
    

    useEffect(() => {
      loadModel()
    }, [])


    //!!!!!!!!!!!!!!!!!!!!!  CSS para esconder el input para subir una imagen desde la pc !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //styles={{width:"0px", height:"0px", visibility:"hidden", opacity:"0"}}

    if(isModelLoading) {
      <h2>Model is Loading...</h2>
    }
  return (
    <div className="App">
      <h1 className='header'>TensorFlow.js</h1>
      <div className='inputHolder'>
        <input type="file" accept='image/*' className='uploadInput' onChange={uploadImage} ref={fileInputRef}/>
         <button onClick={triggerUploadImg}>Subi tu imagen</button> {/*este btn se usa para esconder el input tipico(y horrible) de subir un archivo. Hay que darle estilo   */}
        <span>O pega una URL</span>
        <input type="text" placeholder='URL de tu imagen' ref={textInputRef} onChange={handleURLChange} />
      </div>

      <div className='mainWrapper'>
        <div className='mainContent'>
          {results && results?.map(el => (
            <p>Encontramos un {el.class} con prob {el.score}</p>
          ))}
          <div className='imageHolder'>
            {
              imageURL &&  <img src={imageURL} alt="uploadpreview" crossOrigin='anonymous' ref={imageRef}/>

            }
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

                  </div>
          ))}
          </div>
        </div>
            {imageURL && <button className='button' onClick={detect}>Identificar la imagen</button>}
      </div>
    </div>
  );
}

export default App;
