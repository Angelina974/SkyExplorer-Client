::
:: GENERATE THE APPLICATION JAVASCRIPT BUNDLE
::

:: DELETE EXISTING OUTPUT FILES
del /Q "..\app.js"
del /Q "..\app.css"

:: PROJECT VIEWS
for /R "..\views" %%f in (*.js) do type "%%f" >> "..\app.js"

:: PROJECT MODELS
for /R "..\models" %%f in (*.js) do type "%%f" >> "..\app.js"

:: PROJECT TEXTS
type "..\resources\texts.js" >> "..\app.js"

::
:: GENERATE THE APPLICATION STYLES BUNDLE
::

:: PROJECT VIEWS
for /R "..\views" %%f in (*.css) do type "%%f" >> "..\app.css"

:: PROJECT PLUGINS
for /R "..\plugins" %%f in (*.css) do type "%%f" >> "..\app.css"