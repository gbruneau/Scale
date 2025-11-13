.autocomplete {
  position: relative;
  display: inline-block;
}


.autocomplete-items {
  position: absolute;
  z-index: 99;
  /*position the autocomplete items to be the same width as the container:*/
  top: 100%;
  left: 0;
  right: 0;
  color: black;
  background-color:  var(--inputBG);
  font-size: 14pt;
}

.autocomplete-items div {
  cursor: pointer;
}

.autocomplete-items strong {
    color: red;
}


/*when navigating through the items using the arrow keys:*/
.autocomplete-active {
  background-color: #409399 !important; 
  color: #ffffff; 
}