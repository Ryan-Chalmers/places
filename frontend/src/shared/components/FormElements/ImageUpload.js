import React, {useRef} from "react";

import "./ImageUpload.css";
import Button from "./Button";

const ImageUpload = (props) => {
  const filePickerRef = useRef();

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  const pickedHandler = event => {
    console.log(event.target);
  }

  return (
    <div className="form-control">
      <input
        type="file"
        id={props.id}
        ref={filePickerRef}
        style={{ display: "none" }}
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          <img src="" alt="Preview"/>
        </div>
        <Button type="button" onClick={pickImageHandler}>Pick Image</Button>
      </div>
    </div>
  );
};

export default ImageUpload;
