// the `JavaProxy` decorator specifies the package and the name for the native *.JAVA file generated.
@JavaProxy("org.myApp.Application")
class Application extends android.app.Application {
    onCreate(): void {
        super.onCreate();

        // At this point modules have already been initialized

        // Enter custom initialization code here
    }

    protected attachBaseContext(baseContext: android.content.Context) {
        super.attachBaseContext(baseContext);

        // This code enables MultiDex support for the application (if needed)
        // android.support.multidex.MultiDex.install(this);
    }
}
