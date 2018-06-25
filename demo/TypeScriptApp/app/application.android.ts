@JavaProxy("org.myApp.Application")
class Application extends android.app.Application {
    onCreate(): void {
        super.onCreate();
    }

    protected attachBaseContext(baseContext: any) { // android.content.Context
        super.attachBaseContext(baseContext);
    }
}
