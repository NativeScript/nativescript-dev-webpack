const frame = require("tns-core-modules/ui/frame");

const superProto = androidx.appcompat.app.AppCompatActivity.prototype;
androidx.appcompat.app.AppCompatActivity.extend("org.myApp.MainActivity", {
    onCreate: function(savedInstanceState) {
        // Set isNativeScriptActivity in onCreate.
        // The JS constructor might not be called because the activity is created from Android.
        this.isNativeScriptActivity = true;
        
        if(!this._callbacks) {
            frame.setActivityCallbacks(this);
        }
        this._callbacks.onCreate(this, savedInstanceState, this.getIntent(), superProto.onCreate);
    },
    onSaveInstanceState: function(outState) {
        this._callbacks.onSaveInstanceState(this, outState, superProto.onSaveInstanceState);
    },
    onStart: function() {
        this._callbacks.onStart(this, superProto.onStart);
    },
    onStop: function() {
        this._callbacks.onStop(this, superProto.onStop);
    },
    onDestroy: function() {
        this._callbacks.onDestroy(this, superProto.onDestroy);
    },
    onBackPressed: function() {
        this._callbacks.onBackPressed(this, superProto.onBackPressed);
    },
    onRequestPermissionsResult: function (requestCode, permissions, grantResults) {
        this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined);
    },
    onActivityResult: function (requestCode, resultCode, data) {
        this._callbacks.onActivityResult(this, requestCode, resultCode, data, _super.prototype.onActivityResult);
    }
});
