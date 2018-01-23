# Chart Importation Samples

This directory contains a set of matched JS files and Zoomdata Chart Export (.ZIP) files, demonstrating the importation of a pre-packaged 3rd party chart into Zoomdata for use with Zoomdata data.

## What's In The Box?

### Part 1
The sample demonstrates basic integration of a chart for use in Zoomdata

### Part 2
The sample builds on part 1, adding dataAccessors to allow Zoomdata users to adjust chart variables including group, metric, and color selections.

[Compare parts 1 and 2](https://www.diffchecker.com/bTd80JTU) of the code. 

## Running the samples
You need the Zoomdata Custom Chart Command Line Interface installed and configured on your workstation to work with these custom charts.  Follow the instructions in the Zoomdata documentation to [install and configure the Command Line Interface](https://www.zoomdata.com/docs/2.6/custom-chart-cli.html)

Chart import files are version dependent.  Download the ZIP file for the part you are working on and the version of Zoomdata you are running - 2.5.x or 2.6.x.
ZIP files are found in the [dist](./dist) folder. 

Open a Command Prompt (Windows) or Terminal (Mac/Linux) and change to the folder containing the downloaded ZIP file.

Use the Custom Chart CLI to import the chart into Zoomdata:

`zd-chart add "Sample Part 1" zd2.5_pt_1_of_2.zip`

* change the chart name and file name if importing part 2
* make sure to import the file matching the version of Zoomdata you are running

Open Zoomdata and log in as a user with administrator privileges.  

Open the sources configuration page, select a source, and go to the "Charts" page, open the "Custom" tab. Enable the new
custom chart for the source and set the configuration if desired, or just accept the defaults and click "Save".

Create a new dashboard using the new chart.
