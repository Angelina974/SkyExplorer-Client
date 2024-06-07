::
:: GENERATE THE APPLICATION JAVASCRIPT BUNDLE
::

:: DELETE EXISTING OUTPUT FILES
del /Q "..\app.js"
del /Q "..\app.css"

:: PROJECT MODELS
for /R "..\models" %%f in (*.js) do type "%%f" >> "..\app.js"

:: PROJECT VIEWS
for /R "..\views" %%f in (*.js) do type "%%f" >> "..\app.js"

:: PROJECT TEMPLATES
for /R "..\templates" %%f in (*.js) do type "%%f" >> "..\app.js"

:: PROJECT CONTROLLERS
for /R "..\controllers" %%f in (*.js) do type "%%f" >> "..\app.js"

::
:: GENERATE THE APPLICATION STYLES BUNDLE
::

:: PROJECT VIEWS
for /R "..\views" %%f in (*.css) do type "%%f" >> "..\app.css"