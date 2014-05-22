var DownloadPopup = function(data) {
    
    this.initialize = function(data) {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
        this.data = data;
        //app.showAlert("DownloadPopup initialized");
    };
    
    this.render = function() {
        var self = this;
        this.el.html(DownloadPopup.template());
        app.dataInterface.GameExists(data.id, function(exists) {
            if (exists) {
                app.dataInterface.getGame(self.data.id, function(error, data) {
                    $("#play").fadeIn();
                    $("#update").fadeIn();
                    $(".DOWNLOAD_img").css("background-image", "url("+data.image+")");
                    $(".DOWNLOAD_img").css("background-size", "cover");
                    $(".DOWNLOAD_name").html(data.name).fadeIn();
                    $(".DOWNLOAD_desc").html(data.description).fadeIn();
                    $("#location").html(data.plz).fadeIn();
                });
            } else {  
                app.dataInterface.downloadGameInfo(self.data.id, function(data) {
                    if (data.name != "") {
                        $("#download").fadeIn();
                        $(".DOWNLOAD_img").css("background-image", "url("+data.image+")");
                        $(".DOWNLOAD_img").css("background-size", "cover");
                        $(".DOWNLOAD_name").html(data.name).fadeIn();
                        $(".DOWNLOAD_desc").html(data.describtion).fadeIn();
                        $("#location").html(data.plz).fadeIn();
                        if (data.size != 0) $("#filesize").html(Math.round(data.size/10000)/100+" MB").fadeIn();
                    } else {
                           
                    }
                }); 
            }
        });
        return this;
    };
    
    this.loading = function() {
        this.el.off("click", ".popup-close");
        $(".popup-close").hide();
        $(".popup-content").html("<img class='loader' src='Assets/loader.gif' />");
        /*setTimeout(function() {
            $(".popup-content").append("<button type='button' class='button link'>Abbruch</button>");
        }, 5000);*/
    };
    
    this.registerEvents = function() {
        var self = this;
        this.el.on("click", ".popup-close", function(){app.closePopup();});
        this.el.on("click", "#play", function(){window.location.hash = "#ingame"+self.data.id;});
        this.el.on("click", "#download", function(){self.loading(); app.dataInterface.downloadGame(self.data.id, function(){window.location.hash = "#ingame"+self.data.id});});
        this.el.on("click", "#update", function(){self.loading(); app.dataInterface.downloadGame(self.data.id, function(){window.location.hash = "#ingame"+self.data.id});});
    };
    
    this.initialize(data);
}
    
DownloadPopup.template = Handlebars.compile($("#download-tpl").html());