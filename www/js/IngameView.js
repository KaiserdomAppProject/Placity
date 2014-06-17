var IngameView = function(id) {
    
    this.initialize = function(id) {
        var self = this;
        this.el = $("<div/>").addClass("page");
        this.basePosition = "right";
        this.registerEvents();
        
        this.gameid = id;
        this.currentContents = [];
        app.dataInterface.getGame(self.gameid, function(error, game) {
                        if (error == 0) {
                            self.currentGame = game;
                            $(".HEADLINE").html(game.name);
                        } else {
                            app.showAlert("Game not found", "INGAME ERROR");     
                        }
                    });
        app.dataInterface.readGamestate(this.gameid, function(state, points) {
            self.state = state;
            self.points = points;
            if (state != -1) {
                app.showDialog("Spiel fortsetzen?", function(code) {if (code == 1) {self.state = -1; self.points = 0;} self.renderContents();}, "Angefangenes Spiel!", ["Nein", "Ja"])
            } else {
                self.renderContents();   
            }
        });
        var FLAG_help = false;
    };
    
    this.render = function() {
        this.el.html(IngameView.template());
        return this;
    };
    
    this.setScroll = function() {
        var self = this;
        if (self.myscroll) {
            setTimeout(function(){self.myscroll.refresh();}, 500);
        } else {
            setTimeout(function(){self.myscroll = new IScroll($('.SCROLL_FRAME', self.el)[0], {
                useTransform: true,
                zoom: false,
                onBeforeScrollStart: null
            });}, 500);
        }  
    };
    
    this.ScaleImage = function(srcWidth, srcHeight) {
        var ratio = Math.min(0.9*$(window).width() / srcWidth, 0.5*$(window).height() / srcHeight);
        alert(srcWidth+" | "+srcHeight+" | "+$(window).width()+" | "+$(window).height());
        return { width:srcWidth*ratio, height:srcHeight*ratio };
    };
    
    this.renderContents = function() {
        var self = this;
        $(".content").html(" ");
        $("#points").text(this.points);
        app.dataInterface.getScreen(this.gameid, this.state, function(code, screen) {
            self.currentScreen = screen;
            var qcount = 0;
            $("#nextScreen").removeClass("disabled");//Reset nextScreen Button after qr-scans
            if (screen.back == "false") {
                $("#lastScreen").addClass("disabled");  
            } else {
                $("#lastScreen").removeClass("disabled");
            };
            switch (code) { //0 - all fine | 1 - startscreen | 2 - endscreen
                    
                case 0:
                    var dur = 150;
                    app.dataInterface.getContents(self.gameid, self.state, function(contents){
                        self.currentContents = contents;
                        for (i=0; i<contents.length; i++) {
                            switch (contents[i].type) {
                                case "1.1":
                                    $(IngameView.ctxttemplate(contents[i])).hide().appendTo(".content").fadeIn(dur);
                                    break;
                            
                                case "1.2":
                                    $(IngameView.ctxtblocktemplate(contents[i])).hide().appendTo(".content").fadeIn(dur);
                                    break;
                        
                                case "1.3":
                                    $(IngameView.cdialogtemplate(contents[i])).hide().appendTo(".content").fadeIn(dur);
                                    break;
                        
                                case "2.0":
                                    $(IngameView.cimgtemplate(contents[i])).appendTo(".content").hide().fadeIn(dur);
                                    /*var image = $(IngameView.cimgtemplate(contents[i])).appendTo(".content").show().hide(); //-> Force Redraw with show().hide()
                                    var aspectRatio = self.ScaleImage(image.width(), image.height());
                                    $(".content_img img:last-of-type").css("width", aspectRatio.width); 
                                    $(".content_img img:last-of-type").css("height", aspectRatio.height);
                                    image.fadeIn(dur);*/
                                    break;
                        
                                case "3.0":
                                    if (app.network == "wifi" || app.network == "ethernet") {
                                        $(".content").append(IngameView.cvideotemplate(contents[i]));
                                    } else if (app.network != "none") {
                                        if (app.dataInterface.getSyncValue("mobileVideo") == "false") {
                                            $(IngameView.cmobilevideotemplate(self.currentContents[i])).hide().appendTo(".content").fadeIn(dur);
                                        } else {
                                            $(IngameView.cvideotemplate(self.currentContents[i])).hide().appendTo(".content").fadeIn(dur);
                                        }
                                    }else {
                                        $(IngameView.cnovideotemplate(contents[i])).hide().appendTo(".content").fadeIn(dur);
                                    }
                                    break;
                        
                                case "4.0":
                                    $(IngameView.csoundtemplate(contents[i])).hide().appendTo(".content").fadeIn(dur);
                                    break;
                        
                                case "5.0":
                                    var input = contents[i];
                                    app.dataInterface.getAnswers(self.gameid, self.state, contents[i].content_id, function(answers) {
                                        input["answers"] = answers;
                                        $(IngameView.csgchtemplate(input)).hide().appendTo(".content").fadeIn(dur);
                                        self.setScroll();
                                    });
                                    qcount += 1;
                                    break;
                        
                                case "6.0":
                                    var input = contents[i];
                                    app.dataInterface.getAnswers(self.gameid, self.state, contents[i].content_id, function(answers) {
                                        input["answers"] = answers;
                                        $(IngameView.cmtchtemplate(input)).hide().appendTo(".content").fadeIn(dur);
                                        self.setScroll();
                                    });
                                    qcount += 1;
                                    break;
                        
                                case "7.0":
                                    var input = contents[i];
                                    app.dataInterface.getAnswers(self.gameid, self.state, contents[i].content_id, function(answers) {
                                        input["answer"] = answers[0];
                                        input["answerl"] = answers[0].txt.length;
                                        $(IngameView.cinputtemplate(input)).hide().appendTo(".content").fadeIn(dur);
                                        self.setScroll();
                                        //setTimeout(function(){$('.txt_input').autotab_magic().autotab_filter('numeric');},0);
                                    });
                                    qcount += 1;
                                    break;
                        
                                case "8.0":
                                    $("#nextScreen").addClass("disabled");
                                    $(IngameView.cqrtemplate(contents[i])).hide().appendTo(".content").fadeIn(dur);
                                    break;
                            }
                            if (qcount > 1) {
                                app.showAlert("Mehr als eine Frage im Screen! Bitte im QE anpassen.", "QuestionEditor Fehler");  
                            };
            
                        }
                    self.setScroll();
                    });
                    if (screen.helptxt != "") {
                        $("#help").show();
                    } else {
                        $("#help").hide();   
                    }
                    break;
                    
                case 1:
                    app.dataInterface.getGame(self.gameid, function(error, game) {
                        if (error == 0) {
                            self.currentGame = game;
                            $(".content").append(IngameView.cstarttemplate(game));
                            /*var aspectRatio = self.ScaleImage($(".content_start img:last-of-type").width(), $(".content_start img:last-of-type").height());
                            $(".content_start img:last-of-type").css("width", aspectRatio.width); 
                            $(".content_start img:last-of-type").css("height", aspectRatio.height);*/
                        } else {
                            app.showAlert("Game not found", "INGAME ERROR");     
                        }
                    });
                    break;
                
                case 2:
                    var input = {points:self.points, name:app.dataInterface.getSyncValue("userName")};
                    $("#help").hide();
                    $(".content").append(IngameView.cendtemplate(input));
                    $("#lastScreen, #nextScreen, #points").addClass("disabled");
                    $("#end").removeClass("disabled");
                    $("#impressum").removeClass("disabled");
                    break;
        }});
    };
    
    this.calculatePoints = function() {
        var act_points = this.points;
        var self = this;
        for (i=0; i<this.currentContents.length; i++) {
            if (FLAG_help) this.currentContents[i].answers[p].points = round(this.currentContents[i].answers[p].points/2);
            switch (this.currentContents[i].type) {
                    case "5.0":
                        var a = $("input:checked");
                        for (p=0;p<a.length;p++) {
                            if (a[p].value=="true"){
                                this.points += parseInt(this.currentContents[i].answers[p].points); 
                                app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].cmessage, "Richtig!");
                            } else {
                                app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].wmessage, "Falsch!");   
                            }
                        }
                        break;
                    
                    case "6.0":
                        var a = $("input:checked");
                        var r = 0;
                        var f = 0;
                        for (p=0;p<a.length;p++) {
                            if (a[p].value=="true"){
                                r++;
                            } else {
                                f++;
                            }
                        }
                        if (f == 0 && r == 0) {
                            break;
                        } else if (f == 0) {
                            app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].cmessage, "Richtig!");
                            this.points += r*parseInt(this.currentContents[i].answers[p].points);
                        } else {
                            app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].wmessage, "Falsch!");
                        } 
                        break;
                        
                    case "7.0":
                        /*var input = "";
                        $(".txt_input").each(function(index){input += $(this).val();});
                        if (input.toLowerCase() == this.currentContents[i].answer.toLowerCase()) {
                            this.points += parseInt(this.currentContents[i].answer.points);  
                            app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].cmessage, "Richtig!");
                        } else if (input != ""){
                            app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].wmessage, "Falsch!");   
                        }*/
                        if ($(".txt_input").val().toLowerCase() == this.currentContents[i].answer.txt.toLowerCase()) {
                            this.points += parseInt(this.currentContents[i].answer.points);
                            app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].cmessage, "Richtig!");
                        } else if ($(".txt_input").val() != ""){
                            app.showAlert(self.currentContents[i].message + "\n" + self.currentContents[i].wmessage, "Falsch!");   
                        }
                        break;
            }
        }
        this.alertPoints(this.points - act_points);
    };
    
    this.alertPoints = function(number) {
        if (number > 0) {
            $("#pointalert").text("+ "+number);
            $("#pointalert").show().delay(1000).fadeOut(500);
        }
    };
    
    this.nextScreen = function() {
        this.state++;
        FLAG_help = false;
        this.renderContents();
    };
    
    this.lastScreen = function() {
        if (this.currentScreen.back == "true") {
            this.state--; 
            this.renderContents();
        } else {
            app.showAlert("Kein Zurück möglich!", "Warnung");   
        }
    };
    
    this.scanCode = function() {
        var self = this;
        if (navigator.notification) {
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");
                scanner.scan(
                    function (result) {
                         if (result.text.lastIndexOf("?") != -1 && result.text.indexOf("www.kaiserdom-app.de/qrcodes") != -1) {
                            if (result.text.slice(result.text.lastIndexOf("?")+1).replace(/^\s+|\s+$/g, "") == self.currentContents[0].txt.replace(/^\s+|\s+$/g, "")) {
                                self.nextScreen();   
                            } else {
                                app.showAlert("Das war leider nicht der richtige Code!", "FEHLER");   
                            }
                        } else {
                            app.showAlert("Kein Placity-Code!","ERROR");       
                        }
                    }, 
                    function (error) {
                        app.showAlert("Scanning failed: " + error, "ERROR");
                    }
                );
        } else {
            var inp = prompt("Code eingeben:", ""); 
            if (inp == self.currentContents[0].txt.replace(/^\s+|\s+$/g, "")) self.nextScreen();
        };
    };
    
    this.onLeave = function() {
        app.dataInterface.writeGamestate(this.gameid, this.state, this.points);  
    };
    
    this.toggleMenu = function() {
        var dur = 100;
        
        if ($(".SIDEBAR").hasClass("on")) {
            $(".SIDEBAR").removeClass("on");
            $(".SIDEBAR").animate({left: "-126px"}, dur);
            
            $(".NAV_BAR").animate({left: "0px"}, dur);
            
            $(".SCROLL_FRAME").animate({left: "0px"}, dur);
            
            $(".BOTTOM_BAR").animate({left: "0px"}, dur);
            $("#menu").removeClass("rotateb");
            $("#menu").html("Menü");
        } else {
            $("#progress").html(((this.state+1) <= this.currentGame.length)?"<span>Fortschritt:</span><br>" + (this.state+1) + "/" + this.currentGame.length:"<span>Fortschritt:</span><br>Ende");
            $(".SIDEBAR").addClass("on");
            $(".SIDEBAR").animate({left: "0px"}, dur);

            $(".NAV_BAR").animate({left: "120px"}, dur);

            $(".SCROLL_FRAME").animate({left: "120px"}, dur);

            $(".BOTTOM_BAR").animate({left: "120px"}, dur);
            $("#menu").addClass("rotateb");
            $("#menu").html("Spiel");
        }
    };
    
    this.registerEvents = function() {
        var self = this;
        this.el.on("click", "#map", function(){window.location.hash = "#map"});
        this.el.on("click", "#menu", function(){self.toggleMenu();});
        
        this.el.on("click", "#end", function(){self.state = 0; self.points = 0;window.location.hash = "#"});
        this.el.on("click", "#impressum", function(){var impressum = self.currentGame.impressum.slice(self.currentGame.impressum.lastIndexOf("Multimediamat")); var iname = self.currentGame.impressum.slice(0,self.currentGame.impressum.lastIndexOf("Multimediamat")); app.openPopup("#impressum", {txt:impressum,name:iname})});
        
        this.el.on("click", "#nextScreen", $.proxy(function(){this.calculatePoints(); this.nextScreen();}, this));
        this.el.on("click", "#lastScreen", $.proxy(function(){this.lastScreen();}, this));
        this.el.on("click", "#help", $.proxy(function(){app.showAlert(this.currentScreen.helptxt, "TIPP"); FLAG_help = true;}, this));
        this.el.on("click", ".qr_scan", $.proxy(function(){this.scanCode();}, this));
        this.el.on("click", "#mobV", $.proxy(function(){app.dataInterface.setValue("mobileVideo", "true", $.proxy(function() {this.renderContents();}, this));}, this));
        this.el.on("click", ".txt_input", function(e) {e.target.focus(); e.target.select();});
        //this.el.on("input", ".txt_input", function(e) {$(e.target).next("input").focus().select();});
        //this.el.on("keyup", ".txt_input", function(e) {if(e.keyCode == 8) {$(e.target).prev("input").focus().select();}else{$(e.target).next("input").focus().select();}});
    };
    
    this.initialize(id);
}
    
IngameView.template = Handlebars.compile($("#ingame-tpl").html());
IngameView.ctxttemplate = Handlebars.compile($("#content-txt-tpl").html());
IngameView.ctxtblocktemplate = Handlebars.compile($("#content-txtblock-tpl").html());
IngameView.cdialogtemplate = Handlebars.compile($("#content-dialog-tpl").html());
IngameView.cimgtemplate = Handlebars.compile($("#content-img-tpl").html());
IngameView.csoundtemplate = Handlebars.compile($("#content-sound-tpl").html());
IngameView.cvideotemplate = Handlebars.compile($("#content-video-tpl").html());
IngameView.cnovideotemplate = Handlebars.compile($("#content-novideo-tpl").html());
IngameView.cmobilevideotemplate = Handlebars.compile($("#content-mobilevideo-tpl").html());
IngameView.csgchtemplate = Handlebars.compile($("#content-sgch-tpl").html());
IngameView.cmtchtemplate = Handlebars.compile($("#content-mtch-tpl").html());
IngameView.cinputtemplate = Handlebars.compile($("#content-input-tpl").html());
IngameView.cqrtemplate = Handlebars.compile($("#content-qr-tpl").html());
IngameView.cendtemplate = Handlebars.compile($("#content-end-tpl").html());
IngameView.cstarttemplate = Handlebars.compile($("#content-start-tpl").html());