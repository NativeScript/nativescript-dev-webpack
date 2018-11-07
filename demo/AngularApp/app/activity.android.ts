import {setActivityCallbacks, AndroidActivityCallbacks} from "ui/frame";

@JavaProxy("org.myApp.MainActivity")
class Activity extends android.support.v7.app.AppCompatActivity {
    public isNativeScriptActivity: boolean;
    private _callbacks: AndroidActivityCallbacks;

    protected onCreate(savedInstanceState: any): void { // android.os.Bundle
        // Set isNativeScriptActivity in onCreate (as done in the original NativeScript activity code).
        // The JS constructor might not be called because the activity is created from Android.
        this.isNativeScriptActivity = true;
        
        if (!this._callbacks) {
            setActivityCallbacks(this);
        }

        this._callbacks.onCreate(this, savedInstanceState, super.onCreate);
    }

    protected onSaveInstanceState(outState: any): void { // android.os.Bundle
        this._callbacks.onSaveInstanceState(this, outState, super.onSaveInstanceState);
    }

    protected onStart(): void {
        this._callbacks.onStart(this, super.onStart);
    }

    protected onStop(): void {
        this._callbacks.onStop(this, super.onStop);
    }

    protected onDestroy(): void {
        this._callbacks.onDestroy(this, super.onDestroy);
    }

    public onBackPressed(): void {
        this._callbacks.onBackPressed(this, super.onBackPressed);
    }

    public onRequestPermissionsResult(requestCode: number, permissions: Array<String>, grantResults: Array<number>): void {
        this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
    }

    protected onActivityResult(requestCode: number, resultCode: number, data: any): void { // android.content.Intent
        this._callbacks.onActivityResult(this, requestCode, resultCode, data, super.onActivityResult);
    }
}
