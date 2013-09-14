var MapView = function() {
    
    this.initialize = function() {
        var self = this;
        this.el = $("<div/>").addClass("page");
        this.basePosition = "right";
        this.registerEvents();
        navigator.geolocation.getCurrentPosition(self.onGeoSuccess,function(error){alert(error.message);});
    };
    
    this.onGeoSuccess = function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        var currentPosition = new google.maps.LatLng(lat, lon);
        
        var mapOptions = {
            zoom: 12,
            center: currentPosition,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        var map = new google.maps.Map($("#map_canvas"), mapOptions);
        
        var marker = new google.maps.Marker({
            position: currentPosition,
            map: map
        });
    };
    
    this.render = function() {
        this.el.html(MapView.template());
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", "#ingame", function(){history.back()});  
    };
    
    this.initialize();
}
    
MapView.template = Handlebars.compile($("#map-tpl").html());