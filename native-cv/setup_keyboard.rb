require 'xcodeproj'
require 'fileutils'

# Configuration
APP_NAME = "VerloAI"
EXTENSION_NAME = "VerloKeyboard"
BUNDLE_ID_PREFIX = "com.saleemshaikh.verloai"
EXTENSION_BUNDLE_ID = "#{BUNDLE_ID_PREFIX}.keyboard"
IOS_DIR = "ios"
NATIVE_CV_DIR = "native-cv"
PROJECT_PATH = "#{IOS_DIR}/#{APP_NAME}.xcodeproj"
DEST_DIR = "#{IOS_DIR}/#{EXTENSION_NAME}"

# Ensure destination exists
FileUtils.mkdir_p(DEST_DIR)

# Copy files from native-cv to ios/VerloKeyboard
Dir.glob("#{NATIVE_CV_DIR}/*").each do |file|
  next if file.include?("setup_keyboard.rb") # Don't copy the script itself
  FileUtils.cp(file, DEST_DIR)
end

puts "📂 Files copied to #{DEST_DIR}"

# Open Project
project = Xcodeproj::Project.open(PROJECT_PATH)
puts "🛠 Opened project: #{PROJECT_PATH}"

# Find App Target
app_target = project.targets.find { |t| t.name == APP_NAME } || project.targets.first

# Check if target exists
target = project.targets.find { |t| t.name == EXTENSION_NAME }
if target
  puts "⚠️ Target #{EXTENSION_NAME} already exists. Updating settings..."
else
  # Create Target
  target = project.new_target(:app_extension, EXTENSION_NAME, :ios, app_target.deployment_target)
  target.product_name = EXTENSION_NAME
  puts "🎯 Created target: #{EXTENSION_NAME}"
end

# Add Group
group = project.main_group.children.find { |c| c.isa == 'PBXGroup' && c.name == EXTENSION_NAME } || project.main_group.new_group(EXTENSION_NAME, EXTENSION_NAME)

# Add Files to Group and Target
source_files = Dir.glob("#{DEST_DIR}/*.swift")

# Add Swift Files
source_files.each do |file_path|
  filename = File.basename(file_path)
  # Check if file ref exists in group
  file_ref = group.children.find { |c| c.name == filename || c.path == filename }
  unless file_ref
    file_ref = group.new_reference(filename)
    puts "📄 Added new ref: #{filename}"
  end
  
  # Check if build file exists in Sources phase
  sources_phase = target.source_build_phase
  unless sources_phase.files_references.include?(file_ref)
    target.add_file_references([file_ref])
    puts "➕ Linked source: #{filename}"
  end
end

# Add Info.plist (Not to build phase, just ref + build setting)
# Ensure file refs exist
plist_ref = group.children.find { |c| c.path == "Info.plist" } || group.new_reference("Info.plist")
entitlements_ref = group.children.find { |c| c.path == "VerloKeyboard.entitlements" } || group.new_reference("VerloKeyboard.entitlements")

# Configure Build Settings (Apply to ALL configurations)
target.build_configurations.each do |config|
  config.build_settings['INFOPLIST_FILE'] = "#{EXTENSION_NAME}/Info.plist"
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = EXTENSION_BUNDLE_ID
  config.build_settings['PRODUCT_NAME'] = EXTENSION_NAME
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = "#{EXTENSION_NAME}/VerloKeyboard.entitlements"
  config.build_settings['SKIP_INSTALL'] = 'YES'
  config.build_settings['LD_RUNPATH_SEARCH_PATHS'] = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
  
  # Ensure Automatic Signing to avoid GUID mismatch errors
  config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
  config.build_settings.delete('PROVISIONING_PROFILE')
  config.build_settings.delete('PROVISIONING_PROFILE_SPECIFIER')
  config.build_settings.delete('DEVELOPMENT_TEAM') # Let Xcode/Expo handle or user select
end

# Set Target Attributes for Automatic Signing
project.root_object.attributes['TargetAttributes'] ||= {}
project.root_object.attributes['TargetAttributes'][target.uuid] = {
  'CreatedOnToolsVersion' => '15.0',
  'ProvisioningStyle' => 'Automatic'
}

# Add Embed App Extensions Build Phase to App Target
embed_phase = app_target.copy_files_build_phases.find { |p| p.dst_subfolder_spec == "13" } # 13 is PlugIns
if embed_phase.nil?
  embed_phase = app_target.new_copy_files_build_phase("Embed App Extensions")
  embed_phase.dst_subfolder_spec = "13" # PlugIns
end

# Add extension product to embed phase
# We need to find the product reference
product_ref = target.product_reference
build_file = embed_phase.add_file_reference(product_ref)
build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

puts "🔗 Linked Extension to Main App"

# Save
project.save
puts "✅ Project saved successfully!"
