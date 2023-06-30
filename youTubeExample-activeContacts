//
//Refer to YouTube Video: https://youtu.be/04HJ1rjc1sA
//
//Get Account Details
accountMap = zoho.crm.getRecordById("Accounts",accountId);
//Get Related Contacts to Account
contactList = zoho.crm.getRelatedRecords("Contacts","Accounts",accountId);
//Prepared the required lists used to order the contacts by Company Status
primaryList = List();
secondaryList = List();
staffList = List();
otherList = List();
orderedContactList = List();
//Check there is at least 1 contact before continuing
if(contactList.size() > 0)
{
	//Check all contacts company status field and remove "Past Employees". Add them to their associated list to order them.
	for each  contact in contactList
	{
		if(contact.get("Company_Status") != "Past Employee")
		{
			if(contact.get("Company_Status") == "Primary")
			{
				primaryList.add({"id":contact.get("id"),"Full_Name":ifnull(contact.get("Full_Name")," "),"Email":ifnull(contact.get("Email")," "),"Mobile":ifnull(contact.get("Mobile")," "),"Company_Status":ifnull(contact.get("Company_Status")," ")});
			}
			else if(contact.get("Company_Status") == "Secondary")
			{
				secondaryList.add({"id":contact.get("id"),"Full_Name":ifnull(contact.get("Full_Name")," "),"Email":ifnull(contact.get("Email")," "),"Mobile":ifnull(contact.get("Mobile")," "),"Company_Status":ifnull(contact.get("Company_Status")," ")});
			}
			else if(contact.get("Company_Status") == "Staff Member")
			{
				staffList.add({"id":contact.get("id"),"Full_Name":ifnull(contact.get("Full_Name")," "),"Email":ifnull(contact.get("Email")," "),"Mobile":ifnull(contact.get("Mobile")," "),"Company_Status":ifnull(contact.get("Company_Status")," ")});
			}
			else
			{
				otherList.add({"id":contact.get("id"),"Full_Name":ifnull(contact.get("Full_Name")," "),"Email":ifnull(contact.get("Email")," "),"Mobile":ifnull(contact.get("Mobile")," "),"Company_Status":ifnull(contact.get("Company_Status")," ")});
			}
		}
	}
	//Add the contact lists in the order you would like them displayed, in this case its 1) Primary, 2) Secondary, etc.
	orderedContactList.addAll(primaryList);
	orderedContactList.addAll(secondaryList);
	orderedContactList.addAll(staffList);
	orderedContactList.addAll(otherList);
	//Check that this ordered list is not empty.
	if(orderedContactList.size() > 0)
	{
		//Prepare the XML & Check there is at lease 1 active contact to be displayed
		rowVal = 0;
		responseXML = "";
		responseXML = responseXML + "<record>";
		for each  orderedContact in orderedContactList
		{
			responseXML = responseXML + "<row no='" + rowVal + "'>";
			responseXML = responseXML + "<FL link ='true' url='<<INSERT ZOHO CRM CONTACTS URL HERE>>" + orderedContact.get("id") + "' val='Contact Name'>" + orderedContact.get("Full_Name") + "</FL>";
			responseXML = responseXML + "<FL val='Email'>" + orderedContact.get("Email") + "</FL>";
			responseXML = responseXML + "<FL val='Mobile'>" + orderedContact.get("Mobile") + "</FL>";
			responseXML = responseXML + "<FL val='Employment Status'>" + orderedContact.get("Company_Status") + "</FL>";
			responseXML = responseXML + "</row>";
			rowVal = rowVal + 1;
		}
		//Close off the XML
		responseXML = responseXML + "</record>";
	}
	else
	{
		//Message to return if there are no active contacts associated to the account
		responseXML = responseXML + "<error><message>No Active Contacts</message></error>";
	}
}
else
{
	//Message to return if there are no contacts associated to the account
	responseXML = responseXML + "<error><message>No Contacts</message></error>";
}
info responseXML;
return responseXML;
