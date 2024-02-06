define([],
  function(){
      function FirebaseReaderAndWriter() {
        this.readDataFromFirebase = function(dataPath, observableArray, handler) { //handle is closured var, will be remembered by inner function
          firebase.database().ref(dataPath).on('value', (snapshot) => { 
            const data = snapshot.val();

            if (!data) { //let firebase do its job, to control my observableArray
              return;
            }
            
            const resultArray = handler ? handler(data) : Object.values(data); 
            observableArray(resultArray);
            observableArray.valueHasMutated(); //know why you ned this?
          });
        };
        
        this.disconnectPortionDataFromFirebase = function(dataPath) { //know why you need this?
          firebase.database().ref(dataPath).off();
        };
        
        this.writeToFirebase= function(dataPath, key, price, date) { 
          if (!price) {
            return;
          }

          const [year, month, day] = calcDate();
          const dateString = date ? date : `${year}-${month}-${day}`;
          firebase.database().ref(`${dataPath}/${dateString}`).transaction(data => { //trasaction can be for both update or create
            data = data || {};
            return {...data, [key]: price} //if value is null will remove key from firebase
          });
        };
        
        this.addToFirebase = function(dataPath, newKey) { 
          if (!newKey) {
            return;
          }
          
          firebase.database().ref(dataPath).transaction(data => { //trasaction can be for both update or create
            data = data || {};
            const [year, month, day] = calcDate(); //from latest timestamp
            //return {...data, [newKey]: 123}; 
            return {...data, [newKey]: {[`${year}-${month}-${day}`]: {"Current Price": 0}}}
          });
          /* https://stackoverflow.com/questions/53615773/add-element-in-json-without-key-identifier-firebase
          The recommended way to add some data to a list without having a (natural) uid is to use the push method: 
          https://firebase.google.com/docs/reference/js/firebase.database.Reference#push.

          So, you should do as follows and Firebase will automatically generate a unique id for your new record:

          firebase.database().ref('/menu/pane/lista').push({ 
                nome: data['nome'],
                prezzo: data['prezzo'],
                attivo: false
          });
          If you don't want the identifiers of your pane nodes to be auto-generated (as alphanumeric value like "-LStoAsjJ....") 
          you would need to generate them yourself. 
          But then you would have to use a transaction to generate this sequence, and this will add some complexity too. 
          It is probably better to use push() and re-engineer your front end code in such a way you can deal with the alphanumeric uids generated by Firebase.
          */
        };

      }
  
      const calcDate = () => { // latest timestampe
        var dateObj = new Date();
        var month = dateObj.getMonth() + 1; //months from 1-12
        month = month < 10 ? '0' + month : month; //this logic is for firebase to sort the key properly by default
        var year = dateObj.getFullYear();
        var day = dateObj.getDate();
        day = day < 10 ? '0' + day : day;
        return [year, month, day];
      }
    
      return new FirebaseReaderAndWriter();
});