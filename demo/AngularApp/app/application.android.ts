@JavaProxy("org.myApp.Application")
class Application extends android.app.Application {
    onCreate(): void {
        super.onCreate();
    }

    protected attachBaseContext(baseContext: android.content.Context) {
        super.attachBaseContext(baseContext);
    }
}
