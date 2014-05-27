var MemoryStore = function (successCallback, errorCallback) {
    
    this.initialize = function () {
        this.initializeValueStore();
        this.db = window.openDatabase("data", "1.0", "Games DB", 5242880);
        this.createTables(successCallback);
    };
    
    this.firstStart = function () {
        return (localStorage.getItem("userName") === null) ? true : false;
    };
    
    this.initializeValueStore = function () {
        if (localStorage.getItem("userName") === null) {
            this.setValue("userName", "Domgärtner");
            this.setValue("userAge", "25");
            this.setValue("mobileVideo", "true");
        }
    };
    
    this.clearValues = function (callback) {
        localStorage.clear();
        this.initializeValueStore();
        callLater(callback);
    };
      
    this.setValue = function (key, value, callback) {
        localStorage.setItem(key, value);
        callLater(callback);
    };
    
    this.getSyncValue = function (key) {
        return localStorage.getItem(key);       
    };
    
    this.getValue = function (key, callback) {
        var data = localStorage.getItem(key);       
        callLater(callback, data);
    };
    
    this.readGamestate = function (id, callback) {
        this.db.transaction(function(tx) {
            tx.executeSql("SELECT state, points FROM games WHERE id = " + id, this.txErrorHandler, function(tx, results) { return callback(results.rows.item(0).state, results.rows.item(0).points)});
        }, txErrorHandler);
    };
    
    this.writeGamestate = function (id, state, points) {
        this.db.transaction(function (tx) {
            tx.executeSql("UPDATE games SET state=?, points=? WHERE id=?", [state, points, id]);
        }, txErrorHandler);
    };
    
    this.downloadGameInfo = function (id, callback) {
        var self = this;
        $.ajax({
            type: "GET",
            url: "http://s515907755.online.de/html/placity/homepage/questioneditor/jsondata.php",
            data: {id:id, command: "info"},
            dataType: "jsonp",
            cache: false,
            success: function (data, status) {
                if (status == "timeout") {
                    app.showAlert("Server-Timeout abgelaufen");
                } else {
                    callback(data);    
                }
            },
            error: function (jqXHR, textStatus, error) {
                app.showAlert(error, "AJAX ERROR INFO"+textStatus);
            }
        });
    };
    
    this.downloadGame = function (id, callback) {
        var self = this;
        $.ajax({
            type: "GET",
            url: "http://s515907755.online.de/html/placity/homepage/questioneditor/jsondata.php",
            data: {id:id},
            dataType: "jsonp",
            cache: false,
            success: function (data) {
                //console.log(data);
                self.updateTables(data, callback);      
            },
            error: function (jqXHR, textStatus, error) {
                app.showAlert(error, "AJAX ERROR "+textStatus);
            }
        });
    };
    
    this.updateTables = function (data, callback) {
          this.db.transaction(
            function (tx) {   
                
                tx.executeSql("DELETE FROM screens WHERE game_id = "+data.id);
                tx.executeSql("DELETE FROM contents WHERE game_id = "+data.id);
                tx.executeSql("DELETE FROM answers WHERE game_id = "+data.id);
                
                var queries = [
                    "INSERT OR REPLACE INTO games"+
                    " (id,"+
                    " name,"+
                    " description,"+
                    " image,"+
                    " location,"+
                    " length,"+
                    " state,"+
                    " impressum,"+
                    " points)"+
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    
                    "INSERT OR REPLACE INTO screens"+
                    " (screen_id,"+
                    " name,"+
                    " helptxt,"+
                    " game_id,"+
                    " back)"+
                    " VALUES (?, ?, ?, ?, ?)",
                    
                    "INSERT OR REPLACE INTO contents"+
                    " (content_id,"+
                    " screen_id,"+
                    " game_id,"+
                    " type,"+
                    " txt,"+
                    " question,"+
                    " src,"+
                    " message,"+
                    " cmessage,"+
                    " wmessage,"+
                    " orientation)"+
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    
                    "INSERT OR REPLACE INTO answers"+
                    " (content_id,"+
                    " screen_id,"+
                    " game_id,"+
                    " txt,"+
                    " value,"+
                    " points)"+
                    " VALUES (?, ?, ?, ?, ?, ?)"
                ];
                
                var back_FLAG = true;
                
                tx.executeSql(queries[0], [data.id,
                                           data.name,
                                           data.describtion,
                                           data.image,
                                           data.plz,
                                           data.pages.length,
                                           -1, 
                                           data.impressum,
                                           0]);
                
                for (i=0;i<data.pages.length;i++) {
                    var ii = i;
                    tx.executeSql(queries[1], [ii,
                                               data.pages[ii].name,
                                               data.pages[ii].helptxt,
                                               data.id,
                                               back_FLAG]);
                    var back_FLAG = true;
                    for (c=0;c<data.pages[i].contents.length;c++) {
                        var index = data.pages[i].contents[c];
                        tx.executeSql(queries[2], [data.contents[index].id,
                                                   ii,
                                                   data.id,
                                                   data.contents[index].type,
                                                   data.contents[index].txt,
                                                   data.contents[index].question,
                                                   data.contents[index].src,
                                                   data.contents[index].message,
                                                   data.contents[index].cmessage,
                                                   data.contents[index].wmessage,
                                                   data.contents[index].orientation]);
                        if (data.contents[index].type == "5.0" || data.contents[index].type == "6.0" || data.contents[index].type == "7.0" || data.contents[index].type == "8.0") {
                            back_FLAG = false;   
                        }
                        if (data.contents[index].answers) {
                            if (data.contents[index].answers.length != 0) {
                                for (a=0;a<data.contents[index].answers.length;a++) {
                                    tx.executeSql(queries[3], [data.contents[index].id,
                                                               ii,
                                                               data.id,
                                                               data.contents[index].answers[a],
                                                               data.contents[index].answer[a],
                                                               data.contents[index].points]);   
                                }
                            } else if (data.contents[index].answer.length != 0) {
                                   tx.executeSql(queries[3], [data.contents[index].id,
                                                               ii,
                                                               data.id,
                                                               data.contents[index].answer,
                                                               true,
                                                               data.contents[index].points]);   
                            }
                        }
                    }
                }
            },
            function(tx) {
                app.showAlert(tx.message, "Update tables failed");  
            },
            function() {
                callLater(callback);   
            }
        ); 
    };
    
    this.dropTables = function(callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql("DROP TABLE IF EXISTS games");
                tx.executeSql("DROP TABLE IF EXISTS screens");
                tx.executeSql("DROP TABLE IF EXISTS contents");
                tx.executeSql("DROP TABLE IF EXISTS answers");                  
            }
        );
        callback();
    }
    
    this.dropGame = function(id, callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql("DELETE FROM games WHERE id = "+id);
                tx.executeSql("DELETE FROM screens WHERE game_id = "+id);
                tx.executeSql("DELETE FROM contents WHERE game_id = "+id);
                tx.executeSql("DELETE FROM answers WHERE game_id = "+id);
            }
        );
        callback();
    }
    
    this.createTables = function(callback) {
        this.db.transaction(
            function(tx) {   
                
                var execute = function(queue) {
                    if (queue.length != 0) {
                        tx.executeSql(queue.shift());
                        execute(queue);
                    }
                }
                
                var queries = [
                    "CREATE TABLE IF NOT EXISTS games"+
                    " (id INTEGER PRIMARY KEY,"+
                    " name VARCHAR(50),"+
                    " description TEXT,"+
                    " image TEXT,"+
                    " location INTEGER,"+
                    " length INTEGER,"+
                    " state INTEGER,"+
                    " impressum TEXT,"+
                    " points INTEGER)",
                    
                    "CREATE TABLE IF NOT EXISTS screens"+
                    " (id INTEGER PRIMARY KEY AUTOINCREMENT,"+
                    " screen_id INTEGER,"+
                    " name VARCHAR(50),"+
                    " helptxt TEXT,"+
                    " game_id INTEGER,"+
                    " back BOOLEAN)",
                    
                    "CREATE TABLE IF NOT EXISTS contents"+
                    " (id INTEGER PRIMARY KEY AUTOINCREMENT,"+
                    " content_id,"+
                    " screen_id INTEGER,"+
                    " game_id INTEGER,"+
                    " type VARCHAR(3),"+
                    " txt TEXT,"+
                    " question TEXT,"+
                    " src TEXT,"+
                    " message TEXT,"+
                    " cmessage TEXT,"+
                    " wmessage TEXT,"+
                    " orientation BOOLEAN)",
                    
                    "CREATE TABLE IF NOT EXISTS answers"+
                    " (id INTEGER PRIMARY KEY AUTOINCREMENT,"+
                    " game_id INTEGER,"+
                    " screen_id INTEGER,"+
                    " content_id INTEGER,"+
                    " txt TEXT,"+
                    " value BOOLEAN,"+
                    " points INTEGER)"
                ];
                execute(queries);
            },
            function(tx) {
                app.showAlert(tx.message, "Create tables failed");  
            },
            function() {
                callLater(callback);
            }
        );     
    };
    
    
    this.getGamelist = function(callback) {
        this.db.transaction(function(tx){
            tx.executeSql("SELECT * FROM games", this.txErrorHandler, function(tx, results){
            var all = []; for (i=0;i<results.rows.length;i++){all[i] = results.rows.item(i);} callback(all);})
            });  
    };
    
    this.getGame = function(gameid, callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT * FROM games WHERE id = "+gameid,
                             this.txErrorHandler,
                             function(tx, results) {
                                 if (results.rows.length != 0) {
                                     callback(0,results.rows.item(0));
                                 } else {
                                    callback(1,[]);   
                                 }
                             });
            },
            this.txErrorHandler            
        ); 
    };
    
    this.GameExists = function(gameid, callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT name FROM games WHERE id = "+gameid,
                             this.txErrorHandler,
                             function(tx, results) {
                                 if (results.rows.length != 0) {
                                     callback(true);
                                 } else {
                                    callback(false);   
                                 }
                             });
            },
            this.txErrorHandler            
        ); 
    };
    
    this.getScreen = function(gameid, screenid, callback) {
        var self = this;
        if (screenid<0) {
            callback(1,[]);
            return;
        }
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT * FROM screens WHERE game_id = "+gameid+" AND screen_id = "+screenid,
                             self.txErrorHandler,
                             function(tx, results) {
                                 if (results.rows.length != 0) {
                                     callback(0,results.rows.item(0));
                                 } else {
                                     callback(2,[]);
                                 }
                             });
            },
            this.txErrorHandler            
        );
    };
    
    this.getContents = function(gameid, screenid, callback) {
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT * FROM contents WHERE game_id = "+gameid+" AND screen_id = "+screenid,
                             this.txErrorHandler,
                             function(tx, results) {
                                var contents = [];
                                for (i=0;i<results.rows.length;i++) {
                                    contents[i] = results.rows.item(i);
                                }
                                callback(contents);
                             });
            },
            this.txErrorHandler
        );
    };
    
    this.getAnswers = function(gameid, screenid, contentid, callback) {
        console.log(gameid + " " +screenid+" "+contentid);
        this.db.transaction(
            function(tx) {
                tx.executeSql("SELECT * FROM answers WHERE game_id = "+gameid+" AND screen_id = "+screenid+" AND content_id = "+contentid,
                             this.txErrorHandler,
                             function(tx, results) {
                                var answers = [];
                                for (i=0;i<results.rows.length;i++) {
                                    answers[i] = results.rows.item(i);
                                }
                                callback(answers);
                             });
            },
            this.txErrorHandler            
        );  
    };
    
    var callLater = function(callback, data) {
        if (callback) {
            setTimeout(function() {
                callback(data);
            });
        }
    };
        
    var txErrorHandler = function(tx) {
        app.showAlert(tx.message, "SQL Error");
    }
    
    this.initialize();
}