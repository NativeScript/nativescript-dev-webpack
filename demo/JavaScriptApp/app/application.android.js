const superProto = android.app.Application.prototype;
android.app.Application.extend("org.myApp.Application", {
    onCreate: function() {
        superProto.onCreate.call(this);
    },
    attachBaseContext: function(base) {
        superProto.attachBaseContext.call(this, base);
    }
});
